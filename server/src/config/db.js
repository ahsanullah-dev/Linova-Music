import mongoose from 'mongoose';
import { ENV } from './env.js';

// Whether we've fallen back to the in-memory mock store because no real
// MongoDB connection is available. Only ever flips to true in development -
// production stays fail-loud on a bad connection so a real config problem
// (wrong Atlas URI, expired credentials, etc.) never masquerades as a
// working server whose writes silently vanish on every restart.
let mockMode = false;

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

    if (ENV.NODE_ENV === 'production') {
      // A broken DB connection in production is a hard stop, not a silent
      // downgrade - Render/whatever host will restart the process and surface
      // this in the logs, which is what you want when Atlas is misconfigured.
      process.exit(1);
    }

    console.warn(
      '[DB] Falling back to the in-memory mock store for local development.\n' +
      '     Nothing you do will persist across a server restart.\n' +
      '     To use a real database instead, set MONGODB_URI in server/.env\n' +
      '     (a local mongod, or your MongoDB Atlas connection string) and restart.'
    );
    mockMode = true;
  }
};

export const getDBStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  isMockMode: mockMode,
  uri: mockMode ? 'mock' : 'configured'
});
