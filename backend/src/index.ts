import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { PrismaClient } from '@prisma/client';
import { Env } from './middleware/authenticate.js';

// Import routers
import authRouter from './routes/auth.js';
import operationsRouter from './routes/operations.js';
import agentRouter from './routes/agent.js';
import copilotRouter from './routes/copilot.js';
import uploadsRouter from './routes/uploads.js';

const app = new Hono<Env>();

// Global Prisma injection
// In Node.js (npm start), reads process.env.DATABASE_URL via dotenv.
// In Cloudflare Workers, c.env.DATABASE_URL is set via wrangler secrets.
app.use('*', async (c, next) => {
  if (!c.var.prisma) {
    const datasourceUrl = (c.env?.DATABASE_URL as string | undefined) ?? process.env.DATABASE_URL ?? '';
    const prisma = new PrismaClient({ datasources: { db: { url: datasourceUrl } } });
    c.set('prisma', prisma);
  }
  await next();
});

// CORS — explicit origin required when credentials: true.
// Wildcard origin (*) + credentials is rejected by browsers.
// Set CORS_ORIGIN env var for production (e.g. https://yourapp.vercel.app).
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use('/api/*', cors({
  origin: allowedOrigin,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  credentials: true,
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.route('/api/auth', authRouter);
app.route('/api/operations', operationsRouter);
app.route('/api/agent', agentRouter);
app.route('/api/copilot', copilotRouter);
app.route('/api/uploads', uploadsRouter);

// 404 Handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error Handler
app.onError((err, c) => {
  console.error('[server error]', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Start the Node.js HTTP server when running via `npm start` / `node dist/index.js`.
// Cloudflare Workers deployment uses the default export instead.
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'cloudflare') {
  const port = Number(process.env.PORT) || 3000;
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`[server] listening on http://localhost:${info.port}`);
  });
}

export default app;
