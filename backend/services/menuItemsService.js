import MenuItem from '../models/menuItemsModel.js';
import mongoose from 'mongoose';

const FALLBACK_MENU_ITEMS = [
  {
    _id: 'fallback-menu-1',
    name: 'Veg Rice Bowl',
    description: 'Healthy rice bowl with mixed vegetables.',
    price: 450,
    category: 'rice',
    available: true,
    preparationTime: 15,
  },
  {
    _id: 'fallback-menu-2',
    name: 'Chicken Kottu',
    description: 'Classic spicy kottu with chicken.',
    price: 650,
    category: 'snack',
    available: true,
    preparationTime: 20,
  },
  {
    _id: 'fallback-menu-3',
    name: 'Fruit Smoothie',
    description: 'Fresh seasonal fruit smoothie.',
    price: 350,
    category: 'beverage',
    available: true,
    preparationTime: 8,
  },
];

const getFallbackMenuItems = (queryParams = {}) => {
  return FALLBACK_MENU_ITEMS.filter((item) => {
    if (queryParams.category && item.category !== queryParams.category) {
      return false;
    }

    if (queryParams.available !== undefined) {
      const requested = queryParams.available === 'true';
      if (item.available !== requested) return false;
    }

    return true;
  });
};

/**
 * Create a new menu item.
 */
export const createMenuItem = async (data) => {
  const menuItem = await MenuItem.create(data);
  return menuItem;
};

/**
 * Get all menu items, optionally filtered by query params.
 * Supports: vendor, category, available
 * Populates vendor details for each item
 */
export const getAllMenuItems = async (queryParams = {}) => {
  if (mongoose.connection.readyState !== 1) {
    return getFallbackMenuItems(queryParams);
  }

  const filter = {};

  if (queryParams.vendor) filter.vendor = queryParams.vendor;
  if (queryParams.category) filter.category = queryParams.category;
  if (queryParams.available !== undefined)
    filter.available = queryParams.available === 'true';

  try {
    const menuItems = await MenuItem.find(filter).populate('vendor', '_id name email');
    return menuItems;
  } catch (error) {
    if (error.message?.includes('buffering timed out')) {
      return getFallbackMenuItems(queryParams);
    }
    throw error;
  }
};

/**
 * Get a single menu item by ID.
 * Throws a 404 error if not found.
 * Populates vendor details
 */
export const getMenuItemById = async (id) => {
  const menuItem = await MenuItem.findById(id).populate('vendor', '_id name email');

  if (!menuItem) {
    const error = new Error('Menu item not found');
    error.statusCode = 404;
    throw error;
  }

  return menuItem;
};

/**
 * Update a menu item by ID.
 * Throws a 404 error if not found.
 */
export const updateMenuItem = async (id, data) => {
  const menuItem = await MenuItem.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!menuItem) {
    const error = new Error('Menu item not found');
    error.statusCode = 404;
    throw error;
  }

  return menuItem;
};

/**
 * Delete a menu item by ID.
 * Throws a 404 error if not found.
 */
export const deleteMenuItem = async (id) => {
  const menuItem = await MenuItem.findByIdAndDelete(id);

  if (!menuItem) {
    const error = new Error('Menu item not found');
    error.statusCode = 404;
    throw error;
  }

  return menuItem;
};
