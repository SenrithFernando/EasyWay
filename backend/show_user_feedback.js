import 'dotenv/config.js';
import mongoose from 'mongoose';
import Feedback from './models/feedback.js';
import User from './models/UserModel.js';
import Order from './models/orderModel.js';

const uri = process.env.MONGO_STRING.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// Get user ID from command line arguments or use default (your user ID)
const targetUserId = process.argv[2] || '69d0dd97ddb2f4b0e9ac66bd'; // Your user ID as default

mongoose.connect(uri).then(async () => {
  try {
    console.log('🔍 Fetching feedback for user...');
    console.log(`👤 Target User ID: ${targetUserId}\n`);
    
    // First, get user details
    const user = await User.findById(targetUserId);
    if (!user) {
      console.log('❌ User not found with ID:', targetUserId);
      
      // Try to find user by studentId if ObjectId fails
      const userByStudentId = await User.findOne({ studentId: targetUserId });
      if (userByStudentId) {
        console.log('✅ Found user by studentId:', userByStudentId.fullName);
        console.log('🔄 Please use this ObjectId instead:', userByStudentId._id);
      }
      process.exit(0);
    }
    
    console.log(`👤 User: ${user.fullName || 'Unknown'}`);
    console.log(`📧 Email: ${user.email || 'Not provided'}`);
    console.log(`🆔 Student ID: ${user.studentId || 'Not provided'}`);
    console.log('─'.repeat(80));
    
    // Get feedback for this specific user
    const userFeedback = await Feedback.find({ studentId: targetUserId })
      .populate('orderId', 'studentName totalAmount status createdAt orderItems')
      .sort({ createdAt: -1 });
    
    if (userFeedback.length === 0) {
      console.log(`\n❌ No feedback found for user: ${user.fullName}`);
      console.log('💡 This user has not submitted any feedback yet.');
      process.exit(0);
    }
    
    console.log(`\n📝 Found ${userFeedback.length} feedback entries:\n`);
    console.log('='.repeat(100));
    
    userFeedback.forEach((feedback, index) => {
      console.log(`\n📝 Feedback #${index + 1}`);
      console.log(`├─ ID: ${feedback.feedbackId}`);
      console.log(`├─ Rating: ${'⭐'.repeat(feedback.rating)} (${feedback.rating}/5)`);
      console.log(`├─ Sentiment: ${feedback.sentiment}`);
      console.log(`├─ Comment: "${feedback.comment}"`);
      console.log(`├─ Date: ${feedback.createdAt.toLocaleString()}`);
      
      if (feedback.orderId) {
        console.log(`├─ Order Details:`);
        console.log(`│  ├─ Student Name: ${feedback.orderId.studentName || 'Unknown'}`);
        console.log(`│  ├─ Total Amount: Rs.${feedback.orderId.totalAmount || 0}`);
        console.log(`│  ├─ Status: ${feedback.orderId.status}`);
        console.log(`│  └─ Order Date: ${feedback.orderId.createdAt?.toLocaleString() || 'Unknown'}`);
        
        if (feedback.orderId.orderItems && feedback.orderId.orderItems.length > 0) {
          console.log(`│  └─ Items: ${feedback.orderId.orderItems.map(item => item.name).join(', ')}`);
        }
      } else {
        console.log(`├─ Order: Not found`);
      }
      
      console.log(`└─ Vendor ID: ${feedback.vendorId || 'Not specified'}`);
      console.log('─'.repeat(100));
    });
    
    // User-specific statistics
    const totalFeedback = userFeedback.length;
    const avgRating = (userFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(2);
    const ratingDistribution = {};
    const sentimentDistribution = {};
    
    userFeedback.forEach(feedback => {
      ratingDistribution[feedback.rating] = (ratingDistribution[feedback.rating] || 0) + 1;
      sentimentDistribution[feedback.sentiment] = (sentimentDistribution[feedback.sentiment] || 0) + 1;
    });
    
    console.log(`\n📈 ${user.fullName}'s FEEDBACK STATISTICS:`);
    console.log('─'.repeat(50));
    console.log(`Total Feedback Given: ${totalFeedback}`);
    console.log(`Average Rating Given: ${avgRating}/5`);
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
