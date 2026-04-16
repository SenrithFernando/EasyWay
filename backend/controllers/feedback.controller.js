import * as feedbackService from './feedback.service.js';
import asyncHandler from '../middleware/asyncHandler.js';

const createDemoFeedback = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  const feedback = await feedbackService.createDemoFeedback({
    studentId: userId,
    vendorId: req.body.vendorId || req.body.canteenId || null,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  return res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully.',
    data: feedback,
  });
});

const createFeedback = asyncHandler(async (req, res) => {
  console.log('🔍 Creating feedback with data:', JSON.stringify(req.body, null, 2));
  console.log('🔍 User from request:', req.user);
  
  const userId = req.user.id || req.user._id;
  console.log('🔍 Extracted userId:', userId);
  
  const feedback = await feedbackService.createFeedback({
    studentId: userId,
    orderId: req.body.orderId,
    vendorId: req.body.vendorId || req.body.canteenId,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  console.log('✅ Feedback created successfully:', feedback.feedbackId);
  return res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully.',
    data: feedback,
  });
});

const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.getFeedbackById(req.params.feedbackId);

  return res.status(200).json({
    success: true,
    message: 'Feedback retrieved successfully.',
    data: feedback,
  });
});

const getFeedbackByVendor = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.getFeedbackForVendor(req.params.vendorId);

  return res.status(200).json({
    success: true,
    message: 'Vendor feedback retrieved successfully.',
    count: feedback.length,
    data: feedback,
  });
});

const getMyFeedback = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const feedback = await feedbackService.getFeedbackForStudent(userId);

  return res.status(200).json({
    success: true,
    message: 'Your feedback history retrieved successfully.',
    count: feedback.length,
    data: feedback,
  });
});

const getVendorFeedbackStats = asyncHandler(async (req, res) => {
  const stats = await feedbackService.getVendorReviewSummary(req.params.vendorId);

  return res.status(200).json({
    success: true,
    message: 'Vendor rating summary retrieved successfully.',
    data: stats,
  });
});

const updateFeedback = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const feedback = await feedbackService.updateFeedback({
    feedbackId: req.params.feedbackId,
    studentId: userId,
    payload: req.body,
  });

  return res.status(200).json({
    success: true,
    message: 'Feedback updated successfully.',
    data: feedback,
  });
});

const deleteFeedback = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  await feedbackService.deleteFeedback({
    feedbackId: req.params.feedbackId,
    studentId: userId,
  });

  return res.status(200).json({
    success: true,
    message: 'Feedback deleted successfully.',
  });
});

const getVendorDashboard = asyncHandler(async (req, res) => {
  const { limit, startDate, endDate, orderType, groupBy } = req.query;

  const dashboard = await feedbackService.getVendorDashboard(
    req.params.vendorId,
    {
      limit: parseInt(limit) || 5,
      startDate,
      endDate,
      orderType,
      groupBy: groupBy || 'day'
    }
  );

  return res.status(200).json({
    success: true,
    message: 'Vendor dashboard data retrieved successfully.',
    data: dashboard,
  });
});

const getVendorRanking = asyncHandler(async (_req, res) => {
  const ranking = await feedbackService.getVendorRanking();

  return res.status(200).json({
    success: true,
    message: 'Vendor ranking retrieved successfully.',
    count: ranking.length,
    data: ranking,
  });
});

const getFeedbackModuleInfo = asyncHandler(async (_req, res) => {
  const info = await feedbackService.getFeedbackModuleInfo();

  return res.status(200).json({
    success: true,
    message: 'Feedback module configuration retrieved successfully.',
    data: info,
  });
});

const getVendorInfo = asyncHandler(async (req, res) => {
  const vendorId = req.user?.vendorId;

  if (!vendorId) {
    return res.status(403).json({
      success: false,
      message: 'User is not associated with a vendor.',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Vendor information retrieved successfully.',
    data: { vendorId },
  });
});

export {
  createDemoFeedback,
  createFeedback,
  deleteFeedback,
  getVendorDashboard,
  getFeedbackModuleInfo,
  getVendorFeedbackStats,
  getVendorRanking,
  getFeedbackByVendor,
  getFeedbackById,
  getMyFeedback,
  updateFeedback,
  getVendorInfo,
};
