import express from 'express';
import * as feedbackController from '../controllers/feedback.controller.js';
import {
  validateCreateFeedback,
  validateDemoFeedback,
  validateUpdateFeedback,
  isValidObjectId,
} from '../middleware/feedback.validation.js';

const validateRouteObjectId = (paramName) => (req, res, next) => {
  if (!isValidObjectId(req.params[paramName])) {
    return res.status(400).json({
      success: false,
      message: `${paramName} must be a valid MongoDB ObjectId.`,
    });
  }

  return next();
};

const passThrough = (_req, _res, next) => next();

const buildFeedbackRouter = (middlewares = {}) => {
  const {
    requireAuth = passThrough,
    requireStudent = passThrough,
    requireManagerOrAdmin = passThrough,
  } = middlewares;

  const router = express.Router();

  router.post(
    '/demo',
    requireAuth,
    validateDemoFeedback,
    feedbackController.createDemoFeedback
  );

  router.post(
    '/',
    requireAuth,
    requireStudent,
    validateCreateFeedback,
    feedbackController.createFeedback
  );

  router.get('/me/vendor', requireAuth, feedbackController.getVendorInfo);
  router.get('/me', requireAuth, requireStudent, feedbackController.getMyFeedback);
  router.get('/meta/module-info', requireAuth, feedbackController.getFeedbackModuleInfo);
  router.get('/ranking/vendors', requireAuth, feedbackController.getVendorRanking);

  router.get(
    '/vendors/:vendorId',
    requireAuth,
    validateRouteObjectId('vendorId'),
    feedbackController.getFeedbackByVendor
  );

  router.get(
    '/vendors/:vendorId/stats',
    requireAuth,
    validateRouteObjectId('vendorId'),
    feedbackController.getVendorFeedbackStats
  );

  router.get(
    '/vendors/:vendorId/dashboard',
    requireAuth,
    requireManagerOrAdmin,
    validateRouteObjectId('vendorId'),
    feedbackController.getVendorDashboard
  );

  router.get(
    '/:feedbackId',
    requireAuth,
    validateRouteObjectId('feedbackId'),
    feedbackController.getFeedbackById
  );

  router.patch(
    '/:feedbackId',
    requireAuth,
    requireStudent,
    validateRouteObjectId('feedbackId'),
    validateUpdateFeedback,
    feedbackController.updateFeedback
  );

  router.delete(
    '/:feedbackId',
    requireAuth,
    requireStudent,
    validateRouteObjectId('feedbackId'),
    feedbackController.deleteFeedback
  );

  return router;
};

export default buildFeedbackRouter;
