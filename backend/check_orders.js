import 'dotenv/config.js';
import mongoose from 'mongoose';

const uri = process.env.MONGO_STRING;

mongoose.connect(uri).then(async () => {
  try {
    const orders = await mongoose.connection.db.collection('orders').find({}).toArray();
    console.log('Total orders:', orders.length);
    orders.forEach((o, i) => {
      console.log(`${i+1}. ID: ${o._id}, Student: ${o.studentName}, Status: ${o.status}, Created: ${o.createdAt}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
}).catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});