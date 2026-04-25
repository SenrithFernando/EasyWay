import express from 'express';
import * as menuItemsController from '../controllers/menuItemsController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(menuItemsController.getAllMenuItems)
  .post(authMiddleware, menuItemsController.createMenuItem);

router
  .route('/:id')
  .get(menuItemsController.getMenuItemById)
  .patch(authMiddleware, menuItemsController.updateMenuItem)
  .delete(authMiddleware, menuItemsController.deleteMenuItem);

export default router;
