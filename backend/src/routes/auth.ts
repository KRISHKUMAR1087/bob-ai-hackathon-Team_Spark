import { Router, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { PrismaClient, User } from '@prisma/client';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helpers ───────────────────────────────────────────────────────────────────

function roleToWire(role: string): 'admin' | 'ship-agent' {
  return role === 'admin' ? 'admin' : 'ship-agent';
}

function wireToDbRole(role: string): 'admin' | 'ship_agent' {
  return role === 'admin' ? 'admin' : 'ship_agent';
}

function signToken(id: string, email: string, role: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  const opts: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'] };
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

router.post('/login-demo', async (req: Request, res: Response) => {
  const parse = LoginDemoSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: 'Invalid body', details: parse.error.issues }); return; }

  const email = parse.data.role === 'admin' ? 'admin@portpulse.demo' : 'agent@portpulse.demo';
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.status(404).json({ error: 'Demo user not found — run db:seed first' }); return; }
    res.json({ token: signToken(user.id, user.email, user.role), user: sanitizeUser(user) });
  } catch (err) {
    console.error('[auth] login-demo', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/auth/google ─────────────────────────────────────────────────────

router.post('/google', async (req: Request, res: Response) => {
  const parse = GoogleSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: 'Invalid body', details: parse.error.issues }); return; }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) { res.status(500).json({ error: 'GOOGLE_CLIENT_ID not set' }); return; }

  let googleEmail: string, googleName: string, googlePhotoUrl: string | null;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: parse.data.idToken, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.email) { res.status(401).json({ error: 'Token missing email claim' }); return; }
    googleEmail = payload.email;
    googleName = payload.name ?? payload.email;
    googlePhotoUrl = payload.picture ?? null;
  } catch {
    res.status(401).json({ error: 'Invalid Google ID token' });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: googleEmail } });
    const isNewUser = !existing;
    const user = await prisma.user.upsert({
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
    res.json({ token: signToken(user.id, user.email, user.role), user: sanitizeUser(user), requiresRoleSelection: isNewUser });
  } catch (err) {
    console.error('[auth] google upsert', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/auth/role ───────────────────────────────────────────────────────

router.post('/role', authenticate, async (req: Request, res: Response) => {
  const parse = RoleSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: 'Invalid body', details: parse.error.issues }); return; }

  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { role: wireToDbRole(parse.data.role) },
    });
    res.json({ token: signToken(user.id, user.email, user.role), user: sanitizeUser(user) });
  } catch (err) {
    console.error('[auth] role update', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('[auth] me', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

router.post('/logout', authenticate, (_req: Request, res: Response) => {
  res.json({ success: true });
});

export default router;
