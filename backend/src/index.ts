import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.js';
import operationsRouter from './routes/operations.js';
import agentRouter from './routes/agent.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(',');

// ── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

// ── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ── General middleware ───────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import uploadsRouter from './routes/uploads.js';

// ── Secure File serving (uploaded documents) ────────────────────────────────
app.use('/api/uploads', uploadsRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Auth routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ── Operations routes ─────────────────────────────────────────────────────────
app.use('/api/operations', operationsRouter);

// ── Agent routes ──────────────────────────────────────────────────────────────
app.use('/api/agent', agentRouter);

// ── Copilot routes ────────────────────────────────────────────────────────────
import copilotRouter from './routes/copilot.js';
app.use('/api/copilot', copilotRouter);

import { errorHandler } from './middleware/errorHandler.js';

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

import { setupWebSocket } from './websocket/hub.js';

// ── Start server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[server] PortPulse API listening on http://localhost:${PORT}`);
  console.log(`[server] NODE_ENV=${process.env.NODE_ENV ?? 'development'}`);
});

setupWebSocket(server);

export default app;
