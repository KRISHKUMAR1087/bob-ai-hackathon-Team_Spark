import { Hono } from 'hono';
import { Env, authenticate } from '../middleware/authenticate.js';
import { createClient } from '@supabase/supabase-js';

const router = new Hono<Env>();

router.use('*', authenticate);

router.get('/:fileId', async (c) => {
  try {
    const prisma = c.var.prisma;
    const fileId = c.req.param('fileId');
    const user = c.var.user;

    const doc = await prisma.shippingDocument.findFirst({
      where: { fileUrl: fileId }
    });

    if (!doc) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Role check: Only admin or the document owner can access it
    if (user.role !== 'admin' && doc.ownerId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
    const { data, error } = await supabase.storage.from('uploads').download(doc.fileUrl!);

    if (error || !data) {
      return c.json({ error: 'Physical file not found in storage' }, 404);
    }

    return new Response(data, { headers: { 'Content-Type': data.type } });
  } catch (err) {
    console.error('[uploads] get file', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router;
