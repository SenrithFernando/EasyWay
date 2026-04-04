import mongoose from 'mongoose';
import {
  FEEDBACK_COMMENT_MAX_LENGTH,
  FEEDBACK_COMMENT_MIN_LENGTH,
  FEEDBACK_SENTIMENT,
} from './feedback.constants.js';

const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    feedbackId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating cannot be more than 5.'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number.',
      },
    },
    comment: {
      type: String,
      required: [true, 'Comment is required.'],
      trim: true,
      minlength: [
        FEEDBACK_COMMENT_MIN_LENGTH,
        `Comment must be at least ${FEEDBACK_COMMENT_MIN_LENGTH} characters long.`,
      ],
      maxlength: [
        FEEDBACK_COMMENT_MAX_LENGTH,
        `Comment cannot exceed ${FEEDBACK_COMMENT_MAX_LENGTH} characters.`,
      ],
    },
    sentiment: {
      type: String,
      enum: Object.values(FEEDBACK_SENTIMENT),
      default: FEEDBACK_SENTIMENT.NEUTRAL,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

feedbackSchema.index({ orderId: 1, studentId: 1 }, { unique: true });
feedbackSchema.index({ vendorId: 1, createdAt: -1 });
feedbackSchema.index({ studentId: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
