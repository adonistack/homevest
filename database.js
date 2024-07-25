const mongoose = require('mongoose');
const { MongoClient, GridFSBucket } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();
let bucket;

const connectToDatabase = async () => {
  
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB connected successfully');
    const client = new MongoClient(process.env.DB_URI);
    await client.connect();
    const db = client.db();
    bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    console.log('Storage initialized');
    mongoose.set('strictPopulate', false);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};


const getBucket = () => {
  if (!bucket) {
    throw new Error('Storage is not initialized');
  }
  return bucket;
};

module.exports = { connectToDatabase, getBucket };
