import 'dotenv/config.js';
import mongoose from 'mongoose';

const uri = process.env.MONGO_STRING;

mongoose.connect(uri).then(async () => {
  try {
    const order = await mongoose.connection.db.collection('orders').findOne(
      { _id: new mongoose.Types.ObjectId('69d11e03ae9c8cc5350216e3') }
    );
    
    console.log('📦 Order Details:');
    console.log('Order StudentID (in DB):', order?.studentId);
    console.log('Your StudentID (Dumini):  69d0dd97ddb2f4b0e9ac66bd');
    console.log('');
    
    if (String(order?.studentId) === '69d0dd97ddb2f4b0e9ac66bd') {
      console.log('✅ IDs MATCH - You can submit feedback!');
    } else {
      console.log('❌ IDs DO NOT MATCH - Order belongs to someone else');
      console.log('Need to update order studentId to your ID');
    }
    
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