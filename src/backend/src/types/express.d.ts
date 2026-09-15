// Augment the Express Request type so req.user is available on all routes
// after the `authenticate` middleware has run.

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string | null;
      };
    }
  }
}

export {};
