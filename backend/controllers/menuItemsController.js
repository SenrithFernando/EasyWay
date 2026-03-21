import * as menuItemsService from '../services/menuItemsService.js';

/**
 * POST /api/menu-items
 * Create a new menu item.
 */
export const createMenuItem = async (req, res, next) => {
  try {
    const menuItem = await menuItemsService.createMenuItem(req.body);

    res.status(201).json({
      status: 'success',
      data: { menuItem },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/menu-items
 * Get all menu items (with optional filters via query params).
 */
export const getAllMenuItems = async (req, res, next) => {
  try {
    const menuItems = await menuItemsService.getAllMenuItems(req.query);

    res.status(200).json({
      status: 'success',
      results: menuItems.length,
      data: { menuItems },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/menu-items/:id
 * Get a single menu item by its ID.
 */
export const getMenuItemById = async (req, res, next) => {
  try {
    const menuItem = await menuItemsService.getMenuItemById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { menuItem },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/menu-items/:id
 * Update a menu item by its ID.
 */
export const updateMenuItem = async (req, res, next) => {
  try {
    const menuItem = await menuItemsService.updateMenuItem(
      req.params.id,
      req.body
    );

    res.status(200).json({
      status: 'success',
      data: { menuItem },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/menu-items/:id
 * Delete a menu item by its ID.
 */
export const deleteMenuItem = async (req, res, next) => {
  try {
    await menuItemsService.deleteMenuItem(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
