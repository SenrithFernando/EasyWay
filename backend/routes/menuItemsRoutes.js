import express from 'express';
import * as menuItemsController from '../controllers/menuItemsController.js';

const router = express.Router();

router
  .route('/')
  .get(menuItemsController.getAllMenuItems)
  .post(menuItemsController.createMenuItem);

router
  .route('/:id')
  .get(menuItemsController.getMenuItemById)
  .patch(menuItemsController.updateMenuItem)
  .delete(menuItemsController.deleteMenuItem);

export default router;
