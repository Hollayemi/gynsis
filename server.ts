import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectDB from './src/config/database';
import {
  errorHandler,
  handle404,
  jsonParseErrorHandler,
  extendResponse,
} from './src/middleware/error';

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from './src/routes/auth.routes';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: 'Too many auth attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 300,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', globalLimiter);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Custom response helpers ──────────────────────────────────────────────────
app.use(jsonParseErrorHandler);
app.use(extendResponse);

// ─── Logger ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  (res as any).data(
    {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
    },
    'Server is healthy'
  );
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes);

// ─── 404 & global error handler ──────────────────────────────────────────────
app.use('*', handle404);
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`
    🚌  NURTW Digital Ticketing Server
    ─────────────────────────────────
    Environment : ${process.env.NODE_ENV}
    Port        : ${PORT}
    Started     : ${new Date().toLocaleTimeString()}
  `);
});

process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! Shutting down…', err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down…', err.name, err.message);
  process.exit(1);
});

export default app;
