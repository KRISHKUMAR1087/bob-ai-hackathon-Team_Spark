import { Hono } from 'hono';
import jwt, { SignOptions } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { User } from '@prisma/client';
import { authenticate, Env } from '../middleware/authenticate.js';

const router = new Hono<Env>();

// ── Helpers ───────────────────────────────────────────────────────────────────

function roleToWire(role: string): 'admin' | 'ship-agent' {
  return role === 'admin' ? 'admin' : 'ship-agent';
}

function wireToDbRole(role: string): 'admin' | 'ship_agent' {
  return role === 'admin' ? 'admin' : 'ship_agent';
}

function signToken(id: string, email: string, role: string, env: any): string {
  const secret = env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  const opts: SignOptions = { expiresIn: (env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'] };
  return jwt.sign({ sub: id, email, role: roleToWire(role) }, secret, opts);
}

function sanitizeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl,
    role: roleToWire(user.role),
    authProvider: user.authProvider as string,
  };
}

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const LoginDemoSchema = z.object({ role: z.enum(['admin', 'ship-agent']) });
const GoogleSchema = z.object({ idToken: z.string().min(1) });
const RoleSchema = z.object({ role: z.enum(['admin', 'ship-agent']) });

// ── POST /api/auth/login-demo ─────────────────────────────────────────────────

router.post('/login-demo', async (c) => {
  const body = await c.req.json();
  const parse = LoginDemoSchema.safeParse(body);
  if (!parse.success) { return c.json({ error: 'Invalid body', details: parse.error.issues }, 400); }

  const email = parse.data.role === 'admin' ? 'admin@portpulse.demo' : 'agent@portpulse.demo';
  try {
    const user = await c.var.prisma.user.findUnique({ where: { email } });
    if (!user) { return c.json({ error: 'Demo user not found — run db:seed first' }, 404); }
    return c.json({ token: signToken(user.id, user.email, user.role, c.env), user: sanitizeUser(user) });
  } catch (err) {
    console.error('[auth] login-demo', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ── POST /api/auth/google ─────────────────────────────────────────────────────

router.post('/google', async (c) => {
  const body = await c.req.json();
  const parse = GoogleSchema.safeParse(body);
  if (!parse.success) { return c.json({ error: 'Invalid body', details: parse.error.issues }, 400); }

  const clientId = c.env.GOOGLE_CLIENT_ID as string;
  if (!clientId) { return c.json({ error: 'GOOGLE_CLIENT_ID not set' }, 500); }

  const googleClient = new OAuth2Client(clientId);

  let googleEmail: string, googleName: string, googlePhotoUrl: string | null;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: parse.data.idToken, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.email) { return c.json({ error: 'Token missing email claim' }, 401); }
    googleEmail = payload.email;
    googleName = payload.name ?? payload.email;
    googlePhotoUrl = payload.picture ?? null;
  } catch {
    return c.json({ error: 'Invalid Google ID token' }, 401);
  }

  try {
    const existing = await c.var.prisma.user.findUnique({ where: { email: googleEmail } });
    const isNewUser = !existing;
    const user = await c.var.prisma.user.upsert({
      where: { email: googleEmail },
      update: { name: googleName, photoUrl: googlePhotoUrl },
      create: {
        id: crypto.randomUUID(),
        email: googleEmail,
        name: googleName,
        photoUrl: googlePhotoUrl,
        role: 'admin',          // placeholder; client calls POST /api/auth/role immediately
        authProvider: 'google',
      },
    });
    return c.json({ token: signToken(user.id, user.email, user.role, c.env), user: sanitizeUser(user), requiresRoleSelection: isNewUser });
  } catch (err) {
    console.error('[auth] google upsert', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ── POST /api/auth/role ───────────────────────────────────────────────────────

router.post('/role', authenticate, async (c) => {
  const body = await c.req.json();
  const parse = RoleSchema.safeParse(body);
  if (!parse.success) { return c.json({ error: 'Invalid body', details: parse.error.issues }, 400); }

  try {
    const user = await c.var.prisma.user.update({
      where: { id: c.var.user!.id },
      data: { role: wireToDbRole(parse.data.role) },
    });
    return c.json({ token: signToken(user.id, user.email, user.role, c.env), user: sanitizeUser(user) });
  } catch (err) {
    console.error('[auth] role update', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

router.get('/me', authenticate, async (c) => {
  try {
    const user = await c.var.prisma.user.findUnique({ where: { id: c.var.user!.id } });
    if (!user) { return c.json({ error: 'User not found' }, 404); }
    return c.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('[auth] me', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

router.post('/logout', authenticate, async (c) => {
  return c.json({ success: true });
});

export default router;
