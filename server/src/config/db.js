import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;
let isMockMode = false;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    isMockMode = false;
    console.log(`[DB] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[DB] MongoDB connection failed (${error.message}). Activating In-Memory Datastore fallback for smooth standalone operation.`);
    isConnected = true;
    isMockMode = true;
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  isMockMode: isMockMode,
  uri: isMockMode ? 'in-memory-fallback' : ENV.MONGODB_URI
});
