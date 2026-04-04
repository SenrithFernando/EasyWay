import express from 'express';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

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
