import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ilovepdf',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  files: {
    maxSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10),
    uploadDir: path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads'),
    outputDir: path.join(__dirname, '../../', process.env.OUTPUT_DIR || 'outputs'),
  },
  cleanup: {
    intervalMinutes: parseInt(process.env.CLEANUP_INTERVAL_MINUTES || '60', 10),
    fileTtlMinutes: parseInt(process.env.FILE_TTL_MINUTES || '60', 10),
  },
};
