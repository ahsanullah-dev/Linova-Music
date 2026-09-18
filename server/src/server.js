import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  await connectDB();

  const server = app.listen(ENV.PORT, () => {
    console.log(`=============================================`);
    console.log(`🚀 LINOVA MUSIC API Server running on port ${ENV.PORT}`);
    console.log(`🔊 Environment: ${ENV.NODE_ENV}`);
    console.log(`🎶 Active Music Provider: ${ENV.MUSIC_PROVIDER}`);
    console.log(`📡 Health endpoint: http://localhost:${ENV.PORT}/api/health`);
    console.log(`=============================================`);
  });

  // Graceful shutdown handling
  const handleShutdown = (signal) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[Server] Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
