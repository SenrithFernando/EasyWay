import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import connectDatabase from './db.js';
import Feedback from './models/feedback.js';
import { analyzeSentimentByRating, analyzeSentimentByKeyword } from './controllers/sentiment.js';

dotenv.config();

const DEMO_PASSWORD = 'Demo@12345';

const buildPasswordHash = (password) =>
  crypto.createHash('sha256').update(password).digest('hex');

const ensureDocument = async (collection, filter, payload) => {
  const existing = await collection.findOne(filter, { projection: { _id: 1 } });
  const _id = existing?._id || new mongoose.Types.ObjectId();

  await collection.updateOne(
    filter,
    {
      $set: {
        ...payload,
        _id,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return _id;
};

const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

const seedFeedbackDemo = async () => {
  await connectDatabase();

  const users = mongoose.connection.collection('users');
  const vendors = mongoose.connection.collection('vendors');
  const orders = mongoose.connection.collection('orders');

  // Clear all feedback before reseeding to avoid unique constraint violations
  await Feedback.deleteMany({});

  const demoStudentId = await ensureDocument(users, { email: 'student.feedback@easyfood.test' }, {
    firstName: 'Ayesha',
    lastName: 'Perera',
    name: 'Ayesha Perera',
    username: 'ayesha_feedback',
    email: 'student.feedback@easyfood.test',
    role: 'student',
    passwordHash: buildPasswordHash(DEMO_PASSWORD),
    isActive: true,
  });

  const studentTwoId = await ensureDocument(users, { email: 'ravi.k@easyfood.test' }, {
    firstName: 'Ravi',
    lastName: 'Karunaratne',
    name: 'Ravi Karunaratne',
    username: 'ravi_feedback',
    email: 'ravi.k@easyfood.test',
    role: 'student',
    passwordHash: buildPasswordHash(DEMO_PASSWORD),
    isActive: true,
  });

  const studentThreeId = await ensureDocument(users, { email: 'nethmi.j@easyfood.test' }, {
    firstName: 'Nethmi',
    lastName: 'Jayasinghe',
    name: 'Nethmi Jayasinghe',
    username: 'nethmi_feedback',
    email: 'nethmi.j@easyfood.test',
    role: 'student',
    passwordHash: buildPasswordHash(DEMO_PASSWORD),
    isActive: true,
  });

  const vendorUserId = await ensureDocument(users, { email: 'vendor@easyfood.test' }, {
    firstName: 'Kamal',
    lastName: 'Fernando',
    name: 'Kamal Fernando',
    username: 'vendor_easyfood',
    email: 'vendor@easyfood.test',
    role: 'vendor',
    passwordHash: buildPasswordHash(DEMO_PASSWORD),
    isActive: true,
  });

  const adminId = await ensureDocument(users, { email: 'admin@easyfood.test' }, {
    firstName: 'System',
    lastName: 'Admin',
    name: 'System Admin',
    username: 'admin_easyfood',
    email: 'admin@easyfood.test',
    role: 'admin',
    passwordHash: buildPasswordHash(DEMO_PASSWORD),
    isActive: true,
  });

  const campusSpiceHubId = await ensureDocument(vendors, { name: 'Campus Spice Hub' }, {
    name: 'Campus Spice Hub',
    description: 'Popular hot meals and quick student lunch combos.',
  });

  // Link vendor user to vendor
  await users.updateOne(
    { _id: vendorUserId },
    { $set: { vendorId: campusSpiceHubId } }
  );

  const freshBowlCornerId = await ensureDocument(vendors, { name: 'Fresh Bowl Corner' }, {
    name: 'Fresh Bowl Corner',
    description: 'Healthy rice bowls, fruits, and juices.',
  });

  const nightBitesStationId = await ensureDocument(vendors, { name: 'Night Bites Station' }, {
    name: 'Night Bites Station',
    description: 'Late-evening snacks, burgers, and wraps.',
  });

  const orderDefinitions = [
    {
      code: 'ORD-DEMO-2001',
      studentId: demoStudentId,
      vendorId: campusSpiceHubId,
      status: 'completed',
      totalAmount: 1250,
      items: [
        { name: 'Chicken Kottu', quantity: 1, price: 900 },
        { name: 'Lime Juice', quantity: 1, price: 350 },
      ],
    },
    {
      code: 'ORD-DEMO-2002',
      studentId: demoStudentId,
      vendorId: freshBowlCornerId,
      status: 'completed',
      totalAmount: 980,
      items: [
        { name: 'Veg Rice Bowl', quantity: 1, price: 700 },
        { name: 'Fruit Cup', quantity: 1, price: 280 },
      ],
    },
    {
      code: 'ORD-DEMO-2003',
      studentId: demoStudentId,
      vendorId: nightBitesStationId,
      status: 'completed',
      totalAmount: 1450,
      items: [
        { name: 'Chicken Burger', quantity: 1, price: 1050 },
        { name: 'Fries', quantity: 1, price: 400 },
      ],
    },
    {
      code: 'ORD-DEMO-2004',
      studentId: demoStudentId,
      vendorId: campusSpiceHubId,
      status: 'completed',
      totalAmount: 1150,
      items: [
        { name: 'Seafood Fried Rice', quantity: 1, price: 1150 },
      ],
    },
    {
      code: 'ORD-DEMO-2005',
      studentId: studentTwoId,
      vendorId: campusSpiceHubId,
      status: 'completed',
      totalAmount: 890,
      items: [
        { name: 'Egg Kottu', quantity: 1, price: 890 },
      ],
    },
    {
      code: 'ORD-DEMO-2006',
      studentId: studentTwoId,
      vendorId: freshBowlCornerId,
      status: 'completed',
      totalAmount: 960,
      items: [
        { name: 'Protein Bowl', quantity: 1, price: 960 },
      ],
    },
    {
      code: 'ORD-DEMO-2007',
      studentId: studentThreeId,
      vendorId: nightBitesStationId,
      status: 'completed',
      totalAmount: 1020,
      items: [
        { name: 'Wrap Combo', quantity: 1, price: 1020 },
      ],
    },
    {
      code: 'ORD-DEMO-2008',
      studentId: studentThreeId,
      vendorId: campusSpiceHubId,
      status: 'completed',
      totalAmount: 760,
      items: [
        { name: 'Veg Noodles', quantity: 1, price: 760 },
      ],
    },
    {
      code: 'ORD-DEMO-NEW-SUBMIT',
      studentId: demoStudentId,
      vendorId: campusSpiceHubId,
      status: 'completed',
      totalAmount: 1320,
      items: [
        { name: 'Grilled Chicken Rice', quantity: 1, price: 1320 },
      ],
    },
  ];

  const orderIds = {};

  for (const order of orderDefinitions) {
    orderIds[order.code] = await ensureDocument(orders, { code: order.code }, order);
  }

  const feedbackDefinitions = [
    {
      feedbackId: 'FDB-DEMO-1001',
      studentId: demoStudentId,
      orderId: orderIds['ORD-DEMO-2001'],
      vendorId: campusSpiceHubId,
      rating: 5,
      comment: 'The food was delicious, fresh, and the pickup was very fast.',
      createdAt: hoursAgo(1),
    },
    {
      feedbackId: 'FDB-DEMO-1002',
      studentId: demoStudentId,
      orderId: orderIds['ORD-DEMO-2002'],
      vendorId: freshBowlCornerId,
      rating: 3,
      comment: 'The meal was okay, but service was a little late.',
      createdAt: hoursAgo(5),
    },
    {
      feedbackId: 'FDB-DEMO-1003',
      studentId: demoStudentId,
      orderId: orderIds['ORD-DEMO-2003'],
      vendorId: nightBitesStationId,
      rating: 2,
      comment: 'Burger was cold and the wait felt terrible.',
      createdAt: hoursAgo(26),
    },
    {
      feedbackId: 'FDB-DEMO-1004',
      studentId: studentTwoId,
      orderId: orderIds['ORD-DEMO-2005'],
      vendorId: campusSpiceHubId,
      rating: 4,
      comment: 'Good taste and nice portion size for the price.',
      createdAt: hoursAgo(8),
    },
    {
      feedbackId: 'FDB-DEMO-1005',
      studentId: studentTwoId,
      orderId: orderIds['ORD-DEMO-2006'],
      vendorId: freshBowlCornerId,
      rating: 5,
      comment: 'Fresh ingredients and excellent presentation.',
      createdAt: hoursAgo(30),
    },
    {
      feedbackId: 'FDB-DEMO-1006',
      studentId: studentThreeId,
      orderId: orderIds['ORD-DEMO-2007'],
      vendorId: nightBitesStationId,
      rating: 4,
      comment: 'Wrap was tasty and the order was ready on time.',
      createdAt: hoursAgo(14),
    },

    {
      feedbackId: 'FDB-DEMO-1007',
      studentId: studentThreeId,
      orderId: orderIds['ORD-DEMO-2007'],
      vendorId: nightBitesStationId,
      rating: 1,
      comment: 'Wrap was tasty and the order was ready on time.',
      createdAt: hoursAgo(1),
    },

    {
      feedbackId: 'FDB-DEMO-1007',
      studentId: studentThreeId,
      orderId: orderIds['ORD-DEMO-2008'],
      vendorId: campusSpiceHubId,
      rating: 1,
      comment: 'Very bad experience, noodles were stale and cold.',
      createdAt: hoursAgo(40),
    },
    {
      feedbackId: 'FDB-DEMO-1008',
      studentId: studentThreeId,
      orderId: orderIds['ORD-DEMO-2004'],
      vendorId: campusSpiceHubId,
      rating: 4,
      comment: 'Good flavor, fresh seafood, and quick collection process.',
      createdAt: hoursAgo(2),
    },
  ];

  for (const item of feedbackDefinitions) {
    await Feedback.findOneAndDelete({ orderId: item.orderId, studentId: item.studentId }, { new: false });
    
    await Feedback.create({
      feedbackId: item.feedbackId,
      studentId: item.studentId,
      orderId: item.orderId,
      vendorId: item.vendorId,
      rating: item.rating,
      comment: item.comment,
      sentiment:
        analyzeSentimentByRating(item.rating) || analyzeSentimentByKeyword(item.comment),
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
    });
  }

  console.log('Full demo feedback data seeded successfully.');
  console.log('');
  console.log('=== DATABASE IDs ===');
  console.log('Demo Student ID:', String(demoStudentId));
  console.log('Campus Spice Hub ID:', String(campusSpiceHubId));
  console.log('Fresh Bowl Corner ID:', String(freshBowlCornerId));
  console.log('Night Bites Station ID:', String(nightBitesStationId));
  console.log('');
  console.log('=== DEMO STUDENT ORDER IDs ===');
  console.log('ORD-DEMO-2001:', String(orderIds['ORD-DEMO-2001']));
  console.log('ORD-DEMO-2002:', String(orderIds['ORD-DEMO-2002']));
  console.log('ORD-DEMO-2003:', String(orderIds['ORD-DEMO-2003']));
  console.log('ORD-DEMO-2004:', String(orderIds['ORD-DEMO-2004']));
  console.log('ORD-DEMO-NEW-SUBMIT:', String(orderIds['ORD-DEMO-NEW-SUBMIT']));
  console.log('');
  console.log('=== LOGIN CREDENTIALS ===');
  console.log(`Email: student.feedback@easyfood.test | Password: ${DEMO_PASSWORD}`);
  console.log(`Email: ravi.k@easyfood.test | Password: ${DEMO_PASSWORD}`);
  console.log(`Email: nethmi.j@easyfood.test | Password: ${DEMO_PASSWORD}`);
  console.log(`Email: vendor@easyfood.test | Password: ${DEMO_PASSWORD}`);
  console.log(`Email: admin@easyfood.test | Password: ${DEMO_PASSWORD}`);
  console.log('');
  console.log('=== FEEDBACK SUBMISSION TEST URLS ===');
  console.log('Note: Replace <VENDOR_ID> and <ORDER_ID> with actual IDs from above');
  console.log(`http://localhost:5173/#/blog?vendorId=${campusSpiceHubId}&orderId=${orderIds['ORD-DEMO-NEW-SUBMIT']}`);
  console.log('');
  console.log('=== OTHER TEST PAGES ===');
  console.log(`http://localhost:5173/#/student/feedback/history`);
  console.log(`http://localhost:5173/#/vendors/${campusSpiceHubId}/feedback`);
  console.log(`http://localhost:5173/#/vendor/vendors/${campusSpiceHubId}/feedback-dashboard`);
  console.log('http://localhost:5173/#/admin/vendors/ranking');

  await mongoose.disconnect();
};

seedFeedbackDemo().catch(async (error) => {
  console.error('Failed to seed full demo feedback data:', error);
  await mongoose.disconnect();
  process.exit(1);
});
