import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { vendorMiddleware } from '../middleware/vendorMiddleware.js';

const router = express.Router();

// GET all orders (vendors see their orders, students see theirs)
router.get('/', authMiddleware, orderController.getAllOrders);

// Create an order
router.post('/', authMiddleware, orderController.createOrder);

// Get single order
router.get('/:id', authMiddleware, orderController.getOrderById);

// Update order (vendors can update status)
router.patch('/:id', authMiddleware, vendorMiddleware, orderController.updateOrder);

// Delete order (vendors only)
router.delete('/:id', authMiddleware, vendorMiddleware, orderController.deleteOrder);

// Cancel order (students)
router.patch('/:id/cancel', authMiddleware, orderController.cancelOrder);

export default router;
