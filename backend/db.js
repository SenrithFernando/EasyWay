import mongoose from 'mongoose';

const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_STRING || process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MongoDB connection string is missing. Set MONGO_STRING in .env.');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};

export default connectDatabase;
