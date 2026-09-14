import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import { Env } from './middleware/authenticate.js';

// Import routers
import authRouter from './routes/auth.js';
import operationsRouter from './routes/operations.js';
import agentRouter from './routes/agent.js';
import copilotRouter from './routes/copilot.js';
import uploadsRouter from './routes/uploads.js';

const app = new Hono<Env>();

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// We need a global cache for the Prisma client so we don't exhaust connections
let globalPrisma: PrismaClient | undefined;

import { setPrisma } from './services/operationsService.js';

app.use('*', async (c, next) => {
  if (!c.var.prisma) {
    if (!globalPrisma) {
      // Use HYPERDRIVE connection string for Cloudflare Workers pooling, fallback to DATABASE_URL for Node.js
      const datasourceUrl = c.env?.HYPERDRIVE?.connectionString ?? (c.env?.DATABASE_URL as string | undefined) ?? process.env.DATABASE_URL ?? '';
      const pool = new Pool({ connectionString: datasourceUrl });
      const adapter = new PrismaPg(pool);
      globalPrisma = new PrismaClient({ adapter } as any);
      setPrisma(globalPrisma);
    }
    c.set('prisma', globalPrisma);
  }
  await next();
});

// CORS — explicit origin required when credentials: true.
// Wildcard origin (*) + credentials is rejected by browsers.
// Set CORS_ORIGIN env var for production (e.g. https://yourapp.pages.dev).
app.use('*', cors({
  origin: (origin, c) => {
    const envOrigin = (c.env?.CORS_ORIGIN as string) || 'http://localhost:5173';
    // Support comma-separated origins and .pages.dev preview URLs
    const allowed = envOrigin.split(',').map(o => o.trim());
    if (origin && (allowed.includes(origin) || origin.endsWith('.pages.dev'))) {
      return origin;
    }
    return allowed[0];
  },
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
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  import('@hono/node-server').then(({ serve }) => {
    const port = Number(process.env.PORT) || 3000;
    serve({ fetch: app.fetch, port }, (info) => {
      console.log(`[server] listening on http://localhost:${info.port}`);
    });
  });
}

export default app;
