import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  role: string | null;
  iat?: number;
  exp?: number;
}

/**
 * Verifies the Bearer JWT from the Authorization header and attaches
 * the decoded payload to `req.user`.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
