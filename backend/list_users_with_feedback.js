import 'dotenv/config.js';
import mongoose from 'mongoose';
import Feedback from './models/feedback.js';
import User from './models/UserModel.js';

const uri = process.env.MONGO_STRING.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(uri).then(async () => {
  try {
    console.log('👥 Listing all users with their feedback count...\n');
    
    // Get all users
    const users = await User.find({}).sort({ fullName: 1 });
    
    if (users.length === 0) {
      console.log('❌ No users found in database.');
      process.exit(0);
    }
    
    console.log(`📊 Found ${users.length} users:\n`);
    console.log('='.repeat(120));
    
    for (const user of users) {
      // Count feedback for this user
      const feedbackCount = await Feedback.countDocuments({ studentId: user._id });
      
      console.log(`👤 ${user.fullName || 'Unknown User'}`);
      console.log(`├─ ID: ${user._id}`);
      console.log(`├─ Email: ${user.email || 'Not provided'}`);
      console.log(`├─ Student ID: ${user.studentId || 'Not provided'}`);
      console.log(`├─ Role: ${user.role || 'student'}`);
      console.log(`├─ Feedback Count: ${feedbackCount}`);
      
      if (feedbackCount > 0) {
        // Get average rating for this user
        const userFeedback = await Feedback.find({ studentId: user._id });
        const avgRating = (userFeedback.reduce((sum, f) => sum + f.rating, 0) / userFeedback.length).toFixed(2);
        console.log(`├─ Average Rating: ${avgRating}/5`);
        
        // Show latest feedback
        const latestFeedback = userFeedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        console.log(`├─ Latest Feedback: "${latestFeedback.comment.substring(0, 50)}..." (${latestFeedback.createdAt.toLocaleDateString()})`);
      }
      
      console.log('└─ ' + '─'.repeat(100));
    }
    
    // Summary
    const usersWithFeedback = await User.countDocuments({
      _id: { $in: await Feedback.distinct('studentId') }
    });
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`Total Users: ${users.length}`);
    console.log(`Users with Feedback: ${usersWithFeedback}`);
    console.log(`Users without Feedback: ${users.length - usersWithFeedback}`);
    
    console.log(`\n💡 To view specific user's feedback, run:`);
    console.log(`node show_user_feedback.js <USER_ID>`);
    console.log(`\nExample for your account:`);
    console.log(`node show_user_feedback.js 69d0dd97ddb2f4b0e9ac66bd`);
    
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
