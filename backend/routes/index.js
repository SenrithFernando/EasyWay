import express from 'express';
import buildFeedbackRouter from './feedback.routes.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Real auth: validates JWT and sets req.user from token
const requireAuth = authMiddleware;

// Role guards
const requireStudent = (req, res, next) => {
  if (req.user && (req.user.role === 'student' || req.user.role === 'Student')) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Student access required.' });
};

const requireManagerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin' || req.user.role === 'manager')) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Manager or admin access required.' });
};

router.use(
  '/feedback',
  buildFeedbackRouter({
    requireAuth,
    requireStudent,
    requireManagerOrAdmin,
  })
);

export default router;
