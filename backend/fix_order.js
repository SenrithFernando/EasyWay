import 'dotenv/config.js';
import mongoose from 'mongoose';

const uri = process.env.MONGO_STRING;
const DUMINI_ID = '69d0dd97ddb2f4b0e9ac66bd';

mongoose.connect(uri).then(async () => {
  try {
    const result = await mongoose.connection.db.collection('orders').updateOne(
      { _id: new mongoose.Types.ObjectId('69d10b6d9bffa600d342d430') },
      { $set: { studentId: new mongoose.Types.ObjectId(DUMINI_ID) } }
    );
    
    console.log('✅ Order updated successfully!');
    console.log('StudentID added to order:', DUMINI_ID);
    console.log('Documents modified:', result.modifiedCount);
    console.log('');
    console.log('Now you can submit feedback at:');
    console.log('http://localhost:5173/feedback?vendorId=69bfa3485520fd17a1132224&orderId=69d10b6d9bffa600d342d430');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    mongoose.connection.close();
    process.exit(1);
  }
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});