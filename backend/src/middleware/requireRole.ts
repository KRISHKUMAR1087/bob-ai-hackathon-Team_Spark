import { Context, Next } from 'hono';
import { Env } from './authenticate.js';

export function requireRole(requiredRole: 'admin' | 'ship-agent') {
  return async (c: Context<Env>, next: Next) => {
    const user = c.var.user;
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const roleMatches = requiredRole === 'admin' 
      ? user.role === 'admin' 
      : (user.role === 'ship_agent' || user.role === 'ship-agent');

    if (!roleMatches) {
      return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
    }
    
    await next();
  };
}
