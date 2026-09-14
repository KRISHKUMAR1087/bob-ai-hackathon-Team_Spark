import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import { Env } from './middleware/authenticate.js';

// Import routers (we will convert these next)
import authRouter from './routes/auth.js';
import operationsRouter from './routes/operations.js';
import agentRouter from './routes/agent.js';
import copilotRouter from './routes/copilot.js';
import uploadsRouter from './routes/uploads.js';

const app = new Hono<Env>();

// Global Prisma injection
app.use('*', async (c, next) => {
  if (!c.var.prisma) {
    // Instantiate Prisma using the Cloudflare env variable
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    });
    c.set('prisma', prisma);
  }
  await next();
});

// CORS
app.use('/api/*', cors({
  origin: '*', // Adjust to your frontend URL in production
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

export default app;
