
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not found in .env');
  process.exit(1);
}

async function checkIds() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const feedbackCollection = mongoose.connection.collection('feedbacks');
    const feedback = await feedbackCollection.find({}).toArray();

    console.log(`Checking ${feedback.length} feedback records...`);

    feedback.forEach((item, index) => {
      if (!mongoose.Types.ObjectId.isValid(item.studentId)) {
        console.warn(`Record ${index} has invalid studentId: ${item.studentId} (Type: ${typeof item.studentId})`);
      }
      if (!mongoose.Types.ObjectId.isValid(item.orderId)) {
        console.warn(`Record ${index} has invalid orderId: ${item.orderId} (Type: ${typeof item.orderId})`);
      }
      if (!mongoose.Types.ObjectId.isValid(item.vendorId)) {
        console.warn(`Record ${index} has invalid vendorId: ${item.vendorId} (Type: ${typeof item.vendorId})`);
      }
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkIds();
