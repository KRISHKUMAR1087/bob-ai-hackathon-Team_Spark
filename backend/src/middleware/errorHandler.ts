import { Context } from 'hono';

export function errorHandler(err: Error, c: Context) {
  console.error('[errorHandler]', err.stack);
  
  if (err.name === 'ZodError') {
    return c.json({ error: 'Validation failed', details: (err as any).issues }, 400);
  }

  return c.json({ error: 'Internal server error' }, 500);
}
