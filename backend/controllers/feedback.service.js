import mongoose from 'mongoose';
import HttpError from '../middleware/httpError.js';
import { analyzeSentiment } from './sentiment.js';
import {
  FEEDBACK_EDIT_WINDOW_MINUTES,
  FEEDBACK_COMMENT_MAX_LENGTH,
  FEEDBACK_COMMENT_MIN_LENGTH,
  FEEDBACK_SENTIMENT,
} from '../models/feedback.constants.js';
import loadModel from './loadModel.js';
import Feedback from '../models/feedback.js';

const tryLoadModel = (modelName, candidatePaths) => {
  try {
    return loadModel(modelName, candidatePaths);
  } catch (_error) {
    return null;
  }
};

const getUserModel = () =>
  tryLoadModel('User', ['../../models/User', '../../models/user.model', '../user/user.model']);
const getOrderModel = () =>
  tryLoadModel('Order', ['../../models/Order', '../../models/order.model', '../order/order.model']);
const getVendorModel = () =>
  tryLoadModel('Vendor', [
    '../../models/Vendor',
    '../../models/vendor.model',
    '../vendor/vendor.model',
  ]);

const getUsersCollection = () => mongoose.connection.collection('users');
const getOrdersCollection = () => mongoose.connection.collection('orders');
const getVendorsCollection = () => mongoose.connection.collection('vendors');

const toObjectId = (value) => new mongoose.Types.ObjectId(String(value));

const mapById = (documents = []) =>
  documents.reduce((accumulator, item) => {
    accumulator[String(item._id)] = item;
    return accumulator;
  }, {});

const attachFeedbackRelations = async (feedbackInput) => {
  const feedbackArray = Array.isArray(feedbackInput) ? feedbackInput : [feedbackInput];
  const feedbackDocs = feedbackArray.filter(Boolean);

  if (!feedbackDocs.length) {
    return Array.isArray(feedbackInput) ? [] : null;
  }

  const isValidId = (id) => id && id !== 'undefined' && id !== 'null' && mongoose.Types.ObjectId.isValid(String(id));

  const studentIds = [...new Set(feedbackDocs.map((item) => String(item.studentId)).filter(isValidId))];
  const orderIds = [...new Set(feedbackDocs.map((item) => String(item.orderId)).filter(isValidId))];
  const vendorIds = [...new Set(feedbackDocs.map((item) => String(item.vendorId)).filter(isValidId))];

  const User = getUserModel();
  const Order = getOrderModel();
  const Vendor = getVendorModel();

  const [students, orders, vendors] = await Promise.all([
    User
      ? User.find({ _id: { $in: studentIds.map(toObjectId) } })
          .select('_id firstName lastName name email')
          .lean()
      : getUsersCollection()
          .find(
            { _id: { $in: studentIds.map(toObjectId) } },
            { projection: { _id: 1, firstName: 1, lastName: 1, name: 1, email: 1 } }
          )
          .toArray(),
    Order
      ? Order.find({ _id: { $in: orderIds.map(toObjectId) } }).select('_id status code').lean()
      : getOrdersCollection()
          .find(
            { _id: { $in: orderIds.map(toObjectId) } },
            { projection: { _id: 1, status: 1, code: 1 } }
          )
          .toArray(),
    Vendor
      ? Vendor.find({ _id: { $in: vendorIds.map(toObjectId) } }).select('_id name').lean()
      : getVendorsCollection()
          .find(
            { _id: { $in: vendorIds.map(toObjectId) } },
            { projection: { _id: 1, name: 1 } }
          )
          .toArray(),
  ]);

  const studentsById = mapById(students);
  const ordersById = mapById(orders);
  const vendorsById = mapById(vendors);

  const normalized = feedbackDocs.map((item) => {
    const plain = typeof item.toObject === 'function' ? item.toObject() : { ...item };

    return {
      ...plain,
      status: plain.sentiment || FEEDBACK_SENTIMENT.NEUTRAL,
      studentId: studentsById[String(plain.studentId)] || plain.studentId,
      orderId: ordersById[String(plain.orderId)] || plain.orderId,
      vendorId: vendorsById[String(plain.vendorId)] || plain.vendorId,
    };
  });

  return Array.isArray(feedbackInput) ? normalized : normalized[0];
};

const buildFeedbackId = () => {
  const uniquePart = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return `FDB-${uniquePart}`;
};

const normalizeOrderStatus = (status) => String(status || '').trim().toLowerCase();

const isOrderCompleted = (order) => {
  const completedStatuses = new Set(['completed', 'delivered', 'fulfilled']);
  return completedStatuses.has(normalizeOrderStatus(order.status));
};

const ensureStudentAccount = async (studentId) => {
  const User = getUserModel();
  let student = null;

  if (User) {
    student = await User.findById(studentId).select('_id role firstName lastName name');
  } else {
    student = await getUsersCollection().findOne(
      { _id: new mongoose.Types.ObjectId(String(studentId)) },
      { projection: { _id: 1, role: 1, firstName: 1, lastName: 1, name: 1 } }
    );
  }

  if (!student) {
    throw new HttpError(404, 'Student account not found.');
  }

  if (String(student.role || '').toLowerCase() !== 'student') {
    throw new HttpError(403, 'Only students can perform this action.');
  }

  return student;
};

const ensureOrderForFeedback = async ({ orderId, studentId, vendorId }) => {
  const Order = getOrderModel();
  let order = null;

  if (Order) {
    order = await Order.findById(orderId).select('_id studentId vendorId status');
  } else {
    order = await getOrdersCollection().findOne(
      { _id: new mongoose.Types.ObjectId(String(orderId)) },
      { projection: { _id: 1, studentId: 1, vendorId: 1, status: 1 } }
    );
  }

  if (!order) {
    throw new HttpError(404, 'Order not found.');
  }

  if (String(order.studentId) !== String(studentId)) {
    throw new HttpError(403, 'You can only submit feedback for your own orders.');
  }

  if (String(order.vendorId) !== String(vendorId)) {
    throw new HttpError(400, 'Order is not linked to the provided vendor.');
  }

  if (!isOrderCompleted(order)) {
    throw new HttpError(400, 'Feedback is only allowed for completed orders.');
  }

  return order;
};

const ensureVendorExists = async (vendorId) => {
  const Vendor = getVendorModel();
  let vendor = null;

  if (Vendor) {
    vendor = await Vendor.findById(vendorId).select('_id name');
  } else {
    vendor = await getVendorsCollection().findOne(
      { _id: new mongoose.Types.ObjectId(String(vendorId)) },
      { projection: { _id: 1, name: 1 } }
    );
  }

  if (!vendor) {
    throw new HttpError(404, 'Vendor not found.');
  }

  return vendor;
};

const ensureFeedbackOwnership = (feedback, studentId) => {
  if (String(feedback.studentId) !== String(studentId)) {
    throw new HttpError(403, 'You can only manage your own feedback.');
  }
};

const getRemainingEditWindowMs = (feedback) => {
  const expiresAt =
    new Date(feedback.createdAt).getTime() + FEEDBACK_EDIT_WINDOW_MINUTES * 60 * 1000;

  return expiresAt - Date.now();
};

const ensureFeedbackStillEditable = (feedback) => {
  if (getRemainingEditWindowMs(feedback) <= 0) {
    throw new HttpError(
      403,
      `Feedback can only be edited or deleted within ${FEEDBACK_EDIT_WINDOW_MINUTES} minutes of creation.`
    );
  }
};

const getOrCreateDemoStudent = async () => {
  const student = await getUsersCollection().findOne(
    { role: 'student' },
    { projection: { _id: 1, role: 1 } }
  );
  if (student) {
    return String(student._id);
  }
  const newStudent = {
    _id: new mongoose.Types.ObjectId(),
    firstName: 'Demo',
    lastName: 'Student',
    name: 'Demo Student',
    email: 'demo.student@easyfood.test',
    role: 'student',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await getUsersCollection().insertOne(newStudent);
  return String(newStudent._id);
};

const createDemoOrder = async (studentId, vendorId) => {
  const orderId = new mongoose.Types.ObjectId();
  const order = {
    _id: orderId,
    code: `ORD-DEMO-${Date.now()}`,
    studentId: new mongoose.Types.ObjectId(String(studentId)),
    vendorId: new mongoose.Types.ObjectId(String(vendorId)),
    status: 'completed',
    totalAmount: 0,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await getOrdersCollection().insertOne(order);
  return orderId;
};

const createFeedback = async ({ studentId, orderId, vendorId, rating, comment }) => {
  await ensureStudentAccount(studentId);
  await ensureVendorExists(vendorId);
  await ensureOrderForFeedback({ orderId, studentId, vendorId });

  const existingFeedback = await Feedback.findOne({ orderId, studentId }).select('_id');

  if (existingFeedback) {
    throw new HttpError(409, 'Feedback for this order already exists.');
  }

  const feedback = await Feedback.create({
    feedbackId: buildFeedbackId(),
    studentId,
    orderId,
    vendorId,
    rating,
    comment,
    sentiment: await analyzeSentiment({ comment, rating }),
  });

  return attachFeedbackRelations(await Feedback.findById(feedback._id).lean());
};

const getOrCreateDemoVendor = async (vendorId) => {
  if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
    const vendor = await getVendorsCollection().findOne(
      { _id: new mongoose.Types.ObjectId(String(vendorId)) },
      { projection: { _id: 1 } }
    );
    if (vendor) return String(vendor._id);
  }
  const newVendor = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Demo Vendor',
    description: 'Created for demo feedback.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await getVendorsCollection().insertOne(newVendor);
  return String(newVendor._id);
};

const createDemoFeedback = async ({ vendorId, rating, comment }) => {
  const resolvedVendorId = await getOrCreateDemoVendor(vendorId);
  const studentId = await getOrCreateDemoStudent();
  const orderId = await createDemoOrder(studentId, resolvedVendorId);

  const feedback = await Feedback.create({
    feedbackId: buildFeedbackId(),
    studentId: new mongoose.Types.ObjectId(String(studentId)),
    orderId,
    vendorId: new mongoose.Types.ObjectId(String(resolvedVendorId)),
    rating,
    comment,
    sentiment: await analyzeSentiment({ comment, rating }),
  });

  return attachFeedbackRelations(await Feedback.findById(feedback._id).lean());
};

const getFeedbackById = async (feedbackId) => {
  const feedback = await attachFeedbackRelations(await Feedback.findById(feedbackId).lean());

  if (!feedback) {
    throw new HttpError(404, 'Feedback not found.');
  }

  return feedback;
};

const getFeedbackForVendor = async (vendorId) => {
  await ensureVendorExists(vendorId);

  const feedback = await Feedback.find({ vendorId }).sort({ createdAt: -1 }).lean();
  return attachFeedbackRelations(feedback);
};

const getFeedbackForStudent = async (studentId) => {
  await ensureStudentAccount(studentId);

  const feedback = await Feedback.find({ studentId }).sort({ createdAt: -1 }).lean();
  return attachFeedbackRelations(feedback);
};

const getVendorReviewSummary = async (vendorId) => {
  await ensureVendorExists(vendorId);

  const [summary] = await Feedback.aggregate([
    {
      $match: {
        vendorId: new mongoose.Types.ObjectId(String(vendorId)),
      },
    },
    {
      $group: {
        _id: '$vendorId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return {
    averageRating: summary ? Number(summary.averageRating.toFixed(1)) : 0,
    totalReviews: summary ? summary.totalReviews : 0,
  };
};

const updateFeedback = async ({ feedbackId, studentId, payload }) => {
  const feedback = await Feedback.findById(feedbackId);

  if (!feedback) {
    throw new HttpError(404, 'Feedback not found.');
  }

  ensureFeedbackOwnership(feedback, studentId);
  ensureFeedbackStillEditable(feedback);

  if (payload.rating !== undefined) {
    feedback.rating = payload.rating;
  }

  if (payload.comment !== undefined) {
    feedback.comment = payload.comment;
  }

  feedback.sentiment = await analyzeSentiment({
    comment: feedback.comment,
    rating: feedback.rating,
  });

  await feedback.save();

  return attachFeedbackRelations(await Feedback.findById(feedback._id).lean());
};

const deleteFeedback = async ({ feedbackId, studentId }) => {
  const feedback = await Feedback.findById(feedbackId);

  if (!feedback) {
    throw new HttpError(404, 'Feedback not found.');
  }

  ensureFeedbackOwnership(feedback, studentId);
  ensureFeedbackStillEditable(feedback);

  await feedback.deleteOne();
};

const getVendorDashboard = async (vendorId, limit = 5) => {
  await ensureVendorExists(vendorId);

  const objectId = new mongoose.Types.ObjectId(String(vendorId));

  const [stats] = await Feedback.aggregate([
    { $match: { vendorId: objectId } },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: '$vendorId',
              averageRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 },
            },
          },
        ],
        sentimentBreakdown: [
          {
            $group: {
              _id: '$sentiment',
              count: { $sum: 1 },
            },
          },
        ],
        ratingDistribution: [
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        latestReviews: [
          { $sort: { createdAt: -1 } },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: 'studentId',
              foreignField: '_id',
              as: 'student',
            },
          },
          {
            $project: {
              feedbackId: 1,
              rating: 1,
              comment: 1,
              sentiment: 1,
              createdAt: 1,
              student: { $arrayElemAt: ['$student', 0] },
            },
          },
        ],
      },
    },
  ]);

  const summary = stats.summary[0] || { averageRating: 0, totalReviews: 0 };
  const sentimentCounts = {
    Positive: 0,
    Neutral: 0,
    Negative: 0,
  };

  stats.sentimentBreakdown.forEach((item) => {
    sentimentCounts[item._id] = item.count;
  });

  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => {
    const match = stats.ratingDistribution.find((item) => item._id === rating);
    return {
      rating,
      count: match ? match.count : 0,
    };
  });

  return {
    summary: {
      averageRating: Number(Number(summary.averageRating || 0).toFixed(1)),
      totalReviews: summary.totalReviews || 0,
    },
    sentimentBreakdown: sentimentCounts,
    ratingDistribution,
    latestReviews: stats.latestReviews.map((review) => ({
      feedbackId: review.feedbackId,
      rating: review.rating,
      comment: review.comment,
      sentiment: review.sentiment,
      status: review.sentiment || FEEDBACK_SENTIMENT.NEUTRAL,
      createdAt: review.createdAt,
      student: review.student
        ? {
            id: review.student._id,
            name:
              review.student.name ||
              [review.student.firstName, review.student.lastName].filter(Boolean).join(' '),
          }
        : null,
    })),
  };
};

const getVendorRanking = async () => {
  const ranking = await Feedback.aggregate([
    {
      $group: {
        _id: '$vendorId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        sentimentScore: {
          $sum: {
            $switch: {
              branches: [
                { case: { $eq: ['$sentiment', 'Positive'] }, then: 1 },
                { case: { $eq: ['$sentiment', 'Negative'] }, then: -1 },
              ],
              default: 0,
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'vendors',
        localField: '_id',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $project: {
        _id: 0,
        vendorId: '$_id',
        vendorName: { $ifNull: [{ $arrayElemAt: ['$vendor.name', 0] }, 'Unknown Vendor'] },
        averageRating: { $round: ['$averageRating', 1] },
        totalReviews: 1,
        sentimentScore: 1,
      },
    },
    { $sort: { averageRating: -1, sentimentScore: -1, totalReviews: -1, vendorName: 1 } },
  ]);

  return ranking.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));
};

const getFeedbackModuleInfo = async () => ({
  constraints: {
    ratingMin: 1,
    ratingMax: 5,
    commentMinLength: FEEDBACK_COMMENT_MIN_LENGTH,
    commentMaxLength: FEEDBACK_COMMENT_MAX_LENGTH,
    editWindowMinutes: FEEDBACK_EDIT_WINDOW_MINUTES,
    sentiments: Object.values(FEEDBACK_SENTIMENT),
  },
});

export {
  createDemoFeedback,
  createFeedback,
  deleteFeedback,
  getVendorDashboard,
  getFeedbackModuleInfo,
  getVendorRanking,
  getVendorReviewSummary,
  getFeedbackById,
  getFeedbackForVendor,
  getFeedbackForStudent,
  updateFeedback,
};
