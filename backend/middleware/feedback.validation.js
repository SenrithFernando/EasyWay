import mongoose from 'mongoose';
import {
  FEEDBACK_ALLOWED_UPDATE_FIELDS,
  FEEDBACK_COMMENT_MAX_LENGTH,
  FEEDBACK_COMMENT_MIN_LENGTH,
} from '../models/feedback.constants.js';
import { detectSpamComment } from '../controllers/spamDetection.js';

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validateObjectId = (value, fieldName) => {
  if (!isValidObjectId(value)) {
    return `${fieldName} must be a valid MongoDB ObjectId.`;
  }

  return null;
};

const validateRating = (rating) => {
  if (rating === undefined || rating === null || rating === '') {
    return 'Rating is required.';
  }

  if (!Number.isInteger(Number(rating))) {
    return 'Rating must be a whole number.';
  }

  const normalizedRating = Number(rating);

  if (normalizedRating < 1 || normalizedRating > 5) {
    return 'Rating must be between 1 and 5.';
  }

  return null;
};

const validateComment = (comment) => {
  const normalizedComment = String(comment || '').trim();

  if (!normalizedComment) {
    return 'Comment is required.';
  }

  if (normalizedComment.length < FEEDBACK_COMMENT_MIN_LENGTH) {
    return `Comment must be at least ${FEEDBACK_COMMENT_MIN_LENGTH} characters long.`;
  }

  if (normalizedComment.length > FEEDBACK_COMMENT_MAX_LENGTH) {
    return `Comment cannot exceed ${FEEDBACK_COMMENT_MAX_LENGTH} characters.`;
  }

  const spamCheck = detectSpamComment(normalizedComment);

  if (spamCheck.isSpam) {
    return spamCheck.reason;
  }

  return null;
};

const validateCreateFeedback = (req, res, next) => {
  const { orderId, rating, comment } = req.body;
  const vendorId = req.body.vendorId || req.body.canteenId;
  const errors = {};

  const orderIdError = validateObjectId(orderId, 'orderId');
  if (orderIdError) {
    errors.orderId = orderIdError;
  }

  const vendorIdError = validateObjectId(vendorId, 'vendorId');
  if (vendorIdError) {
    errors.vendorId = vendorIdError;
  }

  const ratingError = validateRating(rating);
  if (ratingError) {
    errors.rating = ratingError;
  }

  const commentError = validateComment(comment);
  if (commentError) {
    errors.comment = commentError;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  req.body.rating = Number(rating);
  req.body.comment = String(comment).trim();

  return next();
};

const validateDemoFeedback = (req, res, next) => {
  const vendorId = req.body.vendorId || req.body.canteenId;
  const { rating, comment } = req.body;
  const errors = {};

  if (vendorId !== undefined && vendorId !== null && vendorId !== '') {
    const vendorIdError = validateObjectId(vendorId, 'vendorId');
    if (vendorIdError) {
      errors.vendorId = vendorIdError;
    }
  }

  const ratingError = validateRating(rating);
  if (ratingError) {
    errors.rating = ratingError;
  }

  const commentError = validateComment(comment);
  if (commentError) {
    errors.comment = commentError;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  req.body.rating = Number(rating);
  req.body.comment = String(comment).trim();
  return next();
};

const validateUpdateFeedback = (req, res, next) => {
  const payloadKeys = Object.keys(req.body);
  const errors = {};

  if (payloadKeys.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one field is required to update feedback.',
    });
  }

  const invalidFields = payloadKeys.filter(
    (field) => !FEEDBACK_ALLOWED_UPDATE_FIELDS.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid update fields provided.',
      errors: {
        fields: `Only ${FEEDBACK_ALLOWED_UPDATE_FIELDS.join(', ')} can be updated.`,
      },
    });
  }

  if ('rating' in req.body) {
    const ratingError = validateRating(req.body.rating);
    if (ratingError) {
      errors.rating = ratingError;
    } else {
      req.body.rating = Number(req.body.rating);
    }
  }

  if ('comment' in req.body) {
    const commentError = validateComment(req.body.comment);
    if (commentError) {
      errors.comment = commentError;
    } else {
      req.body.comment = String(req.body.comment).trim();
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }

  return next();
};

export {
  isValidObjectId,
  validateComment,
  validateCreateFeedback,
  validateDemoFeedback,
  validateObjectId,
  validateRating,
  validateUpdateFeedback,
};
