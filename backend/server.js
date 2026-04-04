

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config();

// MongoDB Connection with server startup
const connectDB = async () => {
  try {
    console.log('Environment variables loaded:');
    console.log('MONGO_STRING:', process.env.MONGO_STRING ? 'Present' : 'Missing');
    console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD ? 'Present' : 'Missing');

    const db = process.env.MONGO_STRING.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
    
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', db.replace(process.env.DATABASE_PASSWORD, '****'));

    await mongoose.connect(db);
    console.log('✅ MongoDB connection successful');

    // ✅ Start the server **only after DB is connected**
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}...`);
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1); // Stop the process if DB fails
  }
};

// Start the server
connectDB();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});




