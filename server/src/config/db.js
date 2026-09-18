import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    if (!ENV.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured');
    }

    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log(
      `[DB] MongoDB Connected successfully: ${conn.connection.host}`
    );
  } catch (error) {
    console.error(`[DB] MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export const getDBStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  isMockMode: false,
  uri: 'configured'
});
