import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authenticate.js';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const router = Router();
const uploadDir = process.env.UPLOAD_DIR || './uploads';

router.use(authenticate);

router.get('/:fileId', async (req: Request, res: Response) => {
  try {
    const doc = await prisma.shippingDocument.findFirst({
      where: { fileUrl: req.params.fileId }
    });

    if (!doc) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Role check: Only admin or the document owner can access it
    if (req.user!.role !== 'admin' && doc.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const filePath = path.join(uploadDir, doc.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Physical file not found on disk' });
    }

    res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error('[uploads] get file', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
