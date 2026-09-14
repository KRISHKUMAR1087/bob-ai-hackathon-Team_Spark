import { Request, Response, NextFunction } from 'express';

/**
 * Returns middleware that allows only requests whose `req.user.role` matches
 * one of the provided roles.  Must be used after `authenticate`.
 *
 * @example
 *   router.get('/admin-only', authenticate, requireRole('admin'), handler)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role ?? null;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
}
