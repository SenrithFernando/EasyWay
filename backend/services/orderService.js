import Order from '../models/orderModel.js';
import User from '../models/UserModel.js';
import MenuItem from '../models/menuItemsModel.js';
import mongoose from 'mongoose';

const CANCELLATION_WINDOW_MS = 2 * 60 * 1000;
const PLACEHOLDER_MENU_ITEM_ID = '000000000000000000000001';

const FALLBACK_ORDERS = [
  {
    _id: 'fallback-order-1',
    studentName: 'Student Demo',
    orderType: 'Pickup',
    status: 'Pending',
    totalAmount: 800,
    createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
    cancellationDeadline: new Date(Date.now() + 60 * 1000).toISOString(),
    orderItems: [
      {
        name: 'Veg Rice Bowl',
        quantity: 1,
        price: 450,
        subtotal: 450,
      },
      {
        name: 'Fruit Smoothie',
        quantity: 1,
        price: 350,
        subtotal: 350,
      },
    ],
  },
  {
    _id: 'fallback-order-2',
    studentName: 'Student Demo',
    orderType: 'Delivery',
    status: 'Completed',
    totalAmount: 650,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    orderItems: [
      {
        name: 'Chicken Kottu',
        quantity: 1,
        price: 650,
        subtotal: 650,
      },
    ],
  },
];

const getFallbackOrders = (queryParams = {}) => {
  return FALLBACK_ORDERS.filter((order) => {
    if (queryParams.status && order.status !== queryParams.status) return false;

    if (queryParams.orderType && order.orderType !== queryParams.orderType) {
      return false;
    }

    if (queryParams.studentName) {
      const q = queryParams.studentName.toLowerCase();
      if (!order.studentName.toLowerCase().includes(q)) return false;
    }

    return true;
  });
};

const normalizeOrderItems = (items = []) => {
  return items.map((item) => {
    const rawId = item?.menuItemId;
    const validId =
      typeof rawId === 'string' && /^[0-9a-fA-F]{24}$/.test(rawId)
        ? rawId
        : PLACEHOLDER_MENU_ITEM_ID;

    return {
      ...item,
      menuItemId: validId,
    };
  });
};

const buildFallbackCreatedOrder = (data) => {
  const now = new Date();
  return {
    _id: `local-order-${Date.now()}`,
    studentName: data.studentName,
    orderItems: data.orderItems || [],
    totalAmount: data.totalAmount,
    orderType: data.orderType,
    deliveryAddress: data.deliveryAddress || '',
    phone: data.phone,
    status: 'Pending',
    cancellationDeadline: new Date(now.getTime() + CANCELLATION_WINDOW_MS),
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Create a new order.
 * reqUser is the authenticated student placing the order.
 */
export const createOrder = async (data, reqUser) => {
  console.log('🔍 Creating order for user:', reqUser?.email);
  
  if (!reqUser) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    throw error;
  }

  // Use the authenticated user's ID
  data.studentId = reqUser._id;
  data.studentName = reqUser.fullName || data.studentName;

  const items = data.orderItems || [];
  if (items.length === 0) {
    const error = new Error('Order must contain at least one item');
    error.statusCode = 400;
    throw error;
  }

  // Resolve vendor from menu items
  // Ensure all items are from the same vendor (simplification for v1)
  const menuItemIds = items.map(item => item.menuItemId);
  const foundMenuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
  
  if (foundMenuItems.length === 0 && mongoose.connection.readyState === 1) {
    const error = new Error('Menu items not found');
    error.statusCode = 404;
    throw error;
  }

  // Use the first item's vendor if database is connected
  let vendorId = data.vendorId; // Fallback if provided
  if (foundMenuItems.length > 0) {
    vendorId = foundMenuItems[0].vendor;
    
    // Check if items from multiple vendors are present
    const distinctVendors = [...new Set(foundMenuItems.map(m => m.vendor.toString()))];
    if (distinctVendors.length > 1) {
      const error = new Error('Please only order items from one canteen at a time');
      error.statusCode = 400;
      throw error;
    }
  } else if (!vendorId) {
    // If no DB and no vendorId provided, use a placeholder
    vendorId = PLACEHOLDER_MENU_ITEM_ID;
  }

  const payload = {
    ...data,
    vendor: vendorId,
    orderItems: normalizeOrderItems(items),
    cancellationDeadline:
      data.cancellationDeadline || new Date(Date.now() + CANCELLATION_WINDOW_MS),
  };

  if (mongoose.connection.readyState !== 1) {
    return buildFallbackCreatedOrder(payload);
  }

  try {
    const order = await Order.create(payload);
    
    // Increment student's noFoodOrders count
    await User.findByIdAndUpdate(reqUser._id, { $inc: { noFoodOrders: 1 } });
    
    console.log('✅ Order created successfully:', order._id);
    return order;
  } catch (error) {
    if (error.message?.includes('buffering timed out')) {
      return buildFallbackCreatedOrder(payload);
    }
    throw error;
  }
};

/**
 * Get all orders, optionally filtered by query params and user role.
 */
export const getAllOrders = async (queryParams = {}, userContext = null) => {
  if (mongoose.connection.readyState !== 1) {
    return getFallbackOrders(queryParams);
  }

  const filter = {};

  // Role-based filtering
  if (userContext) {
    const role = userContext.role?.toLowerCase();
    if (role === 'student') {
      filter.studentId = userContext._id;
    } else if (role === 'vendor') {
      try {
        const Canteen = mongoose.model('Canteen');
        const canteen = await Canteen.findOne({ owner: userContext._id });
        if (canteen) {
          filter.vendor = { $in: [userContext._id, canteen._id] };
        } else {
          filter.vendor = userContext._id;
        }
      } catch (err) {
        filter.vendor = userContext._id;
      }
    }
    // Admin can see everything, no filter added
  }

  if (queryParams.status) filter.status = queryParams.status;
  if (queryParams.studentName)
    filter.studentName = { $regex: queryParams.studentName, $options: 'i' };
  if (queryParams.orderType) filter.orderType = queryParams.orderType;

  try {
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return orders;
  } catch (error) {
    if (error.message?.includes('buffering timed out')) {
      return getFallbackOrders(queryParams);
    }
    throw error;
  }
};

/**
 * Get a single order by ID.
 * Populates menu item references.
 */
export const getOrderById = async (id) => {
  const order = await Order.findById(id).populate('orderItems.menuItemId');

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  return order;
};

/**
 * Update an order by ID (e.g. change status).
 */
export const updateOrder = async (id, data) => {
  const order = await Order.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  return order;
};

/**
 * Delete an order by ID.
 */
export const deleteOrder = async (id) => {
  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  return order;
};

/**
 * Cancel an order (only if before the cancellation deadline).
 */
export const cancelOrder = async (id) => {
  const order = await Order.findById(id);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (order.status !== 'Pending') {
    const error = new Error('Only pending orders can be cancelled');
    error.statusCode = 400;
    throw error;
  }

  const effectiveDeadline =
    order.cancellationDeadline ||
    new Date(new Date(order.createdAt).getTime() + CANCELLATION_WINDOW_MS);

  if (new Date() > effectiveDeadline) {
    const error = new Error('Cancellation deadline has passed');
    error.statusCode = 400;
    throw error;
  }

  order.status = 'Cancelled';
  await order.save();

  return order;
};
