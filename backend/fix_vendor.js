import 'dotenv/config.js';
import mongoose from 'mongoose';

const uri = process.env.MONGO_STRING;

mongoose.connect(uri).then(async () => {
  try {
    const result = await mongoose.connection.db.collection('menuitems').updateOne(
      { _id: new mongoose.Types.ObjectId('69beec1774124df8cbd7317f') },
      { $set: { vendor: new mongoose.Types.ObjectId('69bfa3485520fd17a1132224') } }
    );
    
    console.log('✅ Menu item updated:', result.modifiedCount, 'document(s)');
    console.log('Vendor ID changed to: 69bfa3485520fd17a1132224 (v1)');
    
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