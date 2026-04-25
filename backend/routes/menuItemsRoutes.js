import express from 'express';
import * as menuItemsController from '../controllers/menuItemsController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(menuItemsController.getAllMenuItems)
  .post(protect, menuItemsController.createMenuItem);

router
  .route('/:id')
  .get(menuItemsController.getMenuItemById)
  .patch(protect, menuItemsController.updateMenuItem)
  .delete(protect, menuItemsController.deleteMenuItem);

export default router;
