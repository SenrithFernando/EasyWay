import express from 'express';
import mongoose from 'mongoose';
import buildFeedbackRouter from './feedback.routes.js';

const router = express.Router();

// Replace these placeholders with your real auth and role middleware imports.
const requireAuth = async (req, _res, next) => {
  if (req.user?._id) {
    return next();
  }

  if (process.env.DEMO_STUDENT_ID && mongoose.Types.ObjectId.isValid(process.env.DEMO_STUDENT_ID)) {
    req.user = { _id: process.env.DEMO_STUDENT_ID, role: 'student' };
    return next();
  }

  try {
    const demoStudent = await mongoose.connection.collection('users').findOne(
      { role: 'student' },
      { projection: { _id: 1, role: 1 } }
    );
    req.user = demoStudent
      ? { _id: String(demoStudent._id), role: demoStudent.role || 'student' }
      : null;
  } catch {
    req.user = null;
  }

  return next();
};
const requireStudent = (_req, _res, next) => next();
const requireManagerOrAdmin = (_req, _res, next) => next();

router.use(
  '/feedback',
  buildFeedbackRouter({
    requireAuth,
    requireStudent,
    requireManagerOrAdmin,
  })
);

export default router;
