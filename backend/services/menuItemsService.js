import MenuItem from '../models/menuItemsModel.js';

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
 */
export const getAllMenuItems = async (queryParams = {}) => {
  const filter = {};

  if (queryParams.vendor) filter.vendor = queryParams.vendor;
  if (queryParams.category) filter.category = queryParams.category;
  if (queryParams.available !== undefined)
    filter.available = queryParams.available === 'true';

  const menuItems = await MenuItem.find(filter);
  return menuItems;
};

/**
 * Get a single menu item by ID.
 * Throws a 404 error if not found.
 */
export const getMenuItemById = async (id) => {
  const menuItem = await MenuItem.findById(id);

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
