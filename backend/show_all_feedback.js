import 'dotenv/config.js';
import mongoose from 'mongoose';
import Feedback from './models/feedback.js';
import User from './models/UserModel.js';
import Order from './models/orderModel.js';

const uri = process.env.MONGO_STRING.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(uri).then(async () => {
  try {
    console.log('🔍 Fetching all feedback from database...\n');
    
    // Get all feedback with populated user and order details
    const allFeedback = await Feedback.find({})
      .populate('studentId', 'fullName email studentId')
      .populate('orderId', 'studentName totalAmount status createdAt')
      .sort({ createdAt: -1 });
    
    if (allFeedback.length === 0) {
      console.log('❌ No feedback found in database.');
      process.exit(0);
    }
    
    console.log(`📊 Found ${allFeedback.length} feedback entries:\n`);
    console.log('=' .repeat(100));
    
    allFeedback.forEach((feedback, index) => {
      console.log(`\n📝 Feedback #${index + 1}`);
      console.log(`├─ ID: ${feedback.feedbackId}`);
      console.log(`├─ Rating: ${'⭐'.repeat(feedback.rating)} (${feedback.rating}/5)`);
      console.log(`├─ Sentiment: ${feedback.sentiment}`);
      console.log(`├─ Comment: "${feedback.comment}"`);
      console.log(`├─ Date: ${feedback.createdAt.toLocaleString()}`);
      
      if (feedback.studentId) {
        console.log(`├─ Student: ${feedback.studentId.fullName || 'Unknown'} (${feedback.studentId.studentId || 'No Student ID'})`);
        console.log(`├─ Email: ${feedback.studentId.email || 'No Email'}`);
      } else {
        console.log(`├─ Student: Not found`);
      }
      
      if (feedback.orderId) {
        console.log(`├─ Order: ${feedback.orderId.studentName || 'Unknown'} - Rs.${feedback.orderId.totalAmount || 0} (${feedback.orderId.status})`);
        console.log(`├─ Order Date: ${feedback.orderId.createdAt?.toLocaleString() || 'Unknown'}`);
      } else {
        console.log(`├─ Order: Not found`);
      }
      
      console.log(`└─ Vendor ID: ${feedback.vendorId || 'Not specified'}`);
      console.log('─'.repeat(100));
    });
    
    // Summary statistics
    const totalFeedback = allFeedback.length;
    const avgRating = (allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(2);
    const ratingDistribution = {};
    const sentimentDistribution = {};
    
    allFeedback.forEach(feedback => {
      ratingDistribution[feedback.rating] = (ratingDistribution[feedback.rating] || 0) + 1;
      sentimentDistribution[feedback.sentiment] = (sentimentDistribution[feedback.sentiment] || 0) + 1;
    });
    
    console.log('\n📈 SUMMARY STATISTICS:');
    console.log('─'.repeat(50));
    console.log(`Total Feedback Entries: ${totalFeedback}`);
    console.log(`Average Rating: ${avgRating}/5`);
    console.log('\nRating Distribution:');
    Object.keys(ratingDistribution).sort().forEach(rating => {
      console.log(`  ${rating} ⭐: ${ratingDistribution[rating]} entries`);
    });
    console.log('\nSentiment Distribution:');
    Object.keys(sentimentDistribution).forEach(sentiment => {
      console.log(`  ${sentiment}: ${sentimentDistribution[sentiment]} entries`);
    });
    
    mongoose.connection.close();
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    mongoose.connection.close();
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ Database connection error:', err);
  process.exit(1);
});
