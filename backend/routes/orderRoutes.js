import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all order routes
router.use(authMiddleware);

router
  .route('/')
  .get(orderController.getAllOrders)
  .post(orderController.createOrder);

router
  .route('/:id')
  .get(orderController.getOrderById)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

router.patch('/:id/cancel', orderController.cancelOrder);

export default router;
