import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import fs from 'fs';

import { config } from './config';
import { logger } from './utils/logger';
import { scheduleCleanup } from './utils/cleanup';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFound } from './middleware/errorHandler';
import apiRouter from './routes/index';

const app = express();

// ─── Ensure directories exist ──────────────────────────────────────────────
[config.files.uploadDir, config.files.outputDir, 'logs'].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: ['http://localhost:3000', config.frontendUrl],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
  })
);

// ─── Body Parser ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiting ──────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Error Handler ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Optional MongoDB Connection ──────────────────────────────────────────────
async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri, { serverSelectionTimeoutMS: 3000 });
    logger.info(`MongoDB connected: ${config.mongodb.uri}`);
  } catch (err) {
    logger.warn('MongoDB unavailable — running without database persistence.');
  }
}

// ─── Start Server ─────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  scheduleCleanup();

  app.listen(config.port, () => {
    logger.info(`
╔══════════════════════════════════════════════════╗
║       FileSphere Backend API — Running             ║
║   URL  : http://localhost:${config.port}                 ║
║   Mode : ${config.nodeEnv.padEnd(37)}║
║   Jobs : In-Memory (no Redis required)           ║
╚══════════════════════════════════════════════════╝
    `);
  });
}

start().catch((err) => {
  logger.error('Server startup failed:', err);
  process.exit(1);
});

export default app;
