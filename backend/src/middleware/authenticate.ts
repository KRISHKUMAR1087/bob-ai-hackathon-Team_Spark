import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';

export type Env = {
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    GOOGLE_CLIENT_ID: string;
    GEMINI_API_KEY: string;
    HYPERDRIVE?: { connectionString: string };
  };
  Variables: {
    user: User;
    prisma: PrismaClient;
  };
};

export async function authenticate(c: Context<Env>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, c.env.JWT_SECRET) as { sub: string };
    // Prisma is injected in index.ts
    const user = await c.var.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }
    
    c.set('user', user);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
}
