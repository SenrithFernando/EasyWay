import Order from '../models/orderModel.js';

const CANCELLATION_WINDOW_MS = 2 * 60 * 1000;

/**
 * Create a new order.
 */
export const createOrder = async (data) => {
  const payload = {
    ...data,
    cancellationDeadline:
      data.cancellationDeadline || new Date(Date.now() + CANCELLATION_WINDOW_MS),
  };

  const order = await Order.create(payload);
  return order;
};

/**
 * Get all orders, optionally filtered by query params.
 * Supports: status, studentName, orderType
 */
export const getAllOrders = async (queryParams = {}) => {
  const filter = {};

  if (queryParams.status) filter.status = queryParams.status;
  if (queryParams.studentName)
    filter.studentName = { $regex: queryParams.studentName, $options: 'i' };
  if (queryParams.orderType) filter.orderType = queryParams.orderType;

  const orders = await Order.find(filter).sort({ createdAt: -1 });
  return orders;
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
