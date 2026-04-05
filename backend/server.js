

import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config();

const port = process.env.PORT || 3000;

const configureDns = () => {
  const dnsServers =
    (process.env.MONGO_DNS_SERVERS || '8.8.8.8,1.1.1.1')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

  if (dnsServers.length > 0) {
    dns.setServers(dnsServers);
    console.log('Using DNS servers:', dnsServers.join(', '));
  }
};

const sanitizeMongoUri = (uri) => {
  if (!uri) return uri;

  // Fix common typo seen in logs: monngodb.net -> mongodb.net
  if (uri.includes('monngodb.net')) {
    return uri.replaceAll('monngodb.net', 'mongodb.net');
  }

  return uri;
};

const connectDB = async () => {
  try {
    console.log('Environment variables loaded:');
    console.log('MONGO_STRING:', process.env.MONGO_STRING ? 'Present' : 'Missing');
    console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD ? 'Present' : 'Missing');

    if (!process.env.MONGO_STRING) {
      console.warn('⚠️ MONGO_STRING missing. Running API without database connection.');
      return;
    }

    configureDns();

    const rawUri = process.env.MONGO_STRING.includes('<PASSWORD>')
      ? process.env.MONGO_STRING.replace('<PASSWORD>', process.env.DATABASE_PASSWORD || '')
      : process.env.MONGO_STRING;

    const db = sanitizeMongoUri(rawUri);

    console.log('Attempting to connect to MongoDB...');
    if (process.env.DATABASE_PASSWORD) {
      console.log('Connection string:', db.replace(process.env.DATABASE_PASSWORD, '****'));
    }

    await mongoose.connect(db, {
      serverSelectionTimeoutMS: 15000,
      family: 4,
    });
    console.log('✅ MongoDB connection successful');
  } catch (error) {
    console.error('⚠️ MongoDB connection error. Continuing without DB:', error.message);
  }
};

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`✅ Server running on port ${port}...`);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});




