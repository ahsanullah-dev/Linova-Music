import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Resolve .env relative to this file so it works from any working directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/linova_music',
  JWT_SECRET: process.env.JWT_SECRET || 'linova_super_secret_jwt_key_music_2026_stream',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  MUSIC_PROVIDER: process.env.MUSIC_PROVIDER || 'youtube-music',
  YOUTUBE_MUSIC_ENABLED: process.env.YOUTUBE_MUSIC_ENABLED !== 'false',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};

