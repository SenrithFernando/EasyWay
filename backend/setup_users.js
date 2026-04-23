import 'dotenv/config.js';
import mongoose from 'mongoose';

const uri = process.env.MONGO_STRING;

mongoose.connect(uri).then(async () => {
  try {
    // Update Dumini (IT23192546)
    const result1 = await mongoose.connection.db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId('69d0dd97ddb2f4b0e9ac66bd') },
      { $set: { studentId: 'IT23192546' } }
    );
    console.log('Updated Dumini studentId to IT23192546:', result1.modifiedCount);

    // Update Vidula (IT12345678)
    const result2 = await mongoose.connection.db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId('69c0fbbee9f756fad2218e3b') },
      { $set: { studentId: 'IT12345678' } }
    );
    console.log('Updated Vidula studentId to IT12345678:', result2.modifiedCount);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
}).catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});