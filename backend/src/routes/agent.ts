import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { normalizeVessel } from '../services/operationsService.js';

const prisma = new PrismaClient();
const router = Router();
const uploadDir = process.env.UPLOAD_DIR || './uploads';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${crypto.randomUUID()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.use(authenticate, requireRole('ship-agent'));

// ─── Vessels ─────────────────────────────────────────────────────────────────

router.get('/vessels', async (req: Request, res: Response) => {
  try {
    const vessels = await prisma.vessel.findMany({
      where: { ownerId: req.user!.id },
      include: { timelineEvents: true },
      orderBy: { predictedWaitHours: 'desc' },
    });
    res.json(vessels.map(normalizeVessel));
  } catch (err) {
    console.error('[agent] get vessels', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/vessels/:id', async (req: Request, res: Response) => {
  try {
    const vessel = await prisma.vessel.findUnique({
      where: { id: req.params.id },
      include: { timelineEvents: true },
    });
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    if (vessel.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(normalizeVessel(vessel));
  } catch (err) {
    console.error('[agent] get vessel by id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/vessels', async (req: Request, res: Response) => {
  try {
    const vData = req.body;
    const newId = `VES-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const newVessel = await prisma.$transaction(async (tx) => {
      const vessel = await tx.vessel.create({
        data: {
          id: newId,
          name: vData.name || 'New Carrier',
          imo: vData.imo || String(Math.floor(1000000 + Math.random() * 9000000)),
          flag: vData.flag || 'Panama',
          lengthMeters: Number(vData.lengthMeters) || 300,
          draughtMeters: Number(vData.draughtMeters) || 14,
          teuCapacity: Number(vData.teuCapacity) || 12000,
          cargoVolume: Number(vData.cargoVolume) || 8000,
          origin: vData.origin || 'Singapore (SGSIN)',
          destination: vData.destination || 'Rotterdam (NLRTM)',
          eta: vData.eta || 'Tomorrow, 12:00 UTC',
          etd: vData.etd || '+2 Days, 18:00 UTC',
          status: (vData.status || 'Arriving').replace(' ', '_'),
          priority: vData.priority || 'Standard',
          assignedBerth: vData.assignedBerth || 'Unassigned',
          predictedWaitHours: 3.5,
          demurrageRisk: 'Low',
          historicalTurnaroundHours: 20,
          recommendedAction: 'Awaiting port berth assignment and pilot scheduling.',
          ownerId: req.user!.id,
          shippingCompany: vData.shippingCompany || 'Apex Maritime Agency',
          callSign: vData.callSign || 'CALL-' + Math.floor(100 + Math.random() * 900),
          vesselType: vData.vesselType || 'Container Ship',
          voyageNumber: vData.voyageNumber || 'VYG-' + Math.floor(1000 + Math.random() * 9000),
          previousPort: vData.previousPort || 'Busan (KRPUS)',
          nextPort: vData.nextPort || 'Hamburg (DEHAM)',
          requestedBerth: vData.requestedBerth || null,
          requestedArrivalTime: vData.requestedArrivalTime || vData.eta || 'Tomorrow, 12:00 UTC',
          berthDurationHours: Number(vData.berthDurationHours) || 20,
          requestedCranes: Number(vData.requestedCranes) || 3,
          cargoType: vData.cargoType || 'General Cargo & Containers',
          cargoQuantity: vData.cargoQuantity || '850 TEU Discharged',
          containersLoaded: Number(vData.containersLoaded) || 0,
          containersTotal: Number(vData.containersTotal) || 850,
          dangerousGoods: Boolean(vData.dangerousGoods),
          specialNotes: vData.specialNotes || '',
          timelineEvents: {
            create: [
              { stage: 'Port Notice Filed', time: 'Just now', status: 'completed' },
              { stage: 'Pilot Station Entry', time: vData.eta || 'Tomorrow 12:00 UTC', status: 'scheduled' },
              { stage: 'Berthing', time: '+1h after pilot', status: 'scheduled' },
              { stage: 'Discharge Ops', time: '+2h after berthing', status: 'scheduled' },
            ]
          }
        },
        include: { timelineEvents: true }
      });

      if (vData.requestedBerth) {
        await tx.berthRequest.create({
          data: {
            id: `BR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
            vesselId: vessel.id,
            vesselName: vessel.name,
            imo: vessel.imo,
            requestedBerth: vData.requestedBerth,
            requestedArrivalTime: vessel.requestedArrivalTime || vessel.eta,
            estimatedDurationHours: vessel.berthDurationHours || 20,
            requestedCranes: vessel.requestedCranes || 3,
            cargoType: vessel.cargoType || 'Containerized Cargo',
            status: 'Pending',
            submittedAt: new Date().toISOString(),
            notes: vessel.specialNotes || '',
            ownerId: req.user!.id,
          }
        });
      }

      return vessel;
    });

    res.json(normalizeVessel(newVessel));
  } catch (err) {
    console.error('[agent] post vessels', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/vessels/:id', async (req: Request, res: Response) => {
  try {
    const vessel = await prisma.vessel.findUnique({ where: { id: req.params.id } });
    if (!vessel) return res.status(404).json({ error: 'Not found' });
    if (vessel.ownerId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.vessel.update({
      where: { id: req.params.id },
      data: req.body,
      include: { timelineEvents: true },
    });
    res.json(normalizeVessel(updated));
  } catch (err) {
    console.error('[agent] put vessels/:id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/vessels/:id', async (req: Request, res: Response) => {
  try {
    const vessel = await prisma.vessel.findUnique({ where: { id: req.params.id } });
    if (!vessel) return res.status(404).json({ error: 'Not found' });
    if (vessel.ownerId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    // hard delete for now
    await prisma.vessel.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('[agent] delete vessels/:id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Berth Requests ───────────────────────────────────────────────────────────

router.get('/berth-requests', async (req: Request, res: Response) => {
  try {
    const requests = await prisma.berthRequest.findMany({
      where: { ownerId: req.user!.id },
      orderBy: { submittedAt: 'desc' },
    });
    const mapped = requests.map(row => ({
      ...row,
      status: (row.status as string).replace('_', ' '),
    }));
    res.json(mapped);
  } catch (err) {
    console.error('[agent] get berth-requests', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/berth-requests', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newReq = await prisma.berthRequest.create({
      data: {
        id: `BR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        vesselId: data.vesselId,
        vesselName: data.vesselName,
        imo: data.imo,
        requestedBerth: data.requestedBerth,
        requestedArrivalTime: data.requestedArrivalTime,
        estimatedDurationHours: Number(data.estimatedDurationHours) || 20,
        requestedCranes: Number(data.requestedCranes) || 3,
        cargoType: data.cargoType,
        status: 'Pending',
        submittedAt: new Date().toISOString(),
        notes: data.notes || '',
        ownerId: req.user!.id,
      }
    });
    res.json({ ...newReq, status: (newReq.status as string).replace('_', ' ') });
  } catch (err) {
    console.error('[agent] post berth-requests', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Cargo ───────────────────────────────────────────────────────────────────

router.get('/cargo', async (req: Request, res: Response) => {
  try {
    const vessels = await prisma.vessel.findMany({
      where: { ownerId: req.user!.id },
      include: { timelineEvents: true },
      orderBy: { predictedWaitHours: 'desc' },
    });
    // For agent, returning vessels is sufficient to get cargo fields
    res.json(vessels.map(normalizeVessel));
  } catch (err) {
    console.error('[agent] get cargo', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/cargo/:vesselId', async (req: Request, res: Response) => {
  try {
    const vessel = await prisma.vessel.findUnique({ where: { id: req.params.vesselId } });
    if (!vessel) return res.status(404).json({ error: 'Not found' });
    if (vessel.ownerId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    const cargoData = req.body;
    const updated = await prisma.vessel.update({
      where: { id: req.params.vesselId },
      data: {
        cargoType: cargoData.cargoType,
        cargoQuantity: cargoData.cargoQuantity,
        containersLoaded: cargoData.containersLoaded,
        containersTotal: cargoData.containersTotal,
        dangerousGoods: cargoData.dangerousGoods,
        specialNotes: cargoData.specialNotes,
      },
      include: { timelineEvents: true },
    });
    res.json(normalizeVessel(updated));
  } catch (err) {
    console.error('[agent] put cargo/:vesselId', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Documents ───────────────────────────────────────────────────────────────

router.get('/documents', async (req: Request, res: Response) => {
  try {
    const docs = await prisma.shippingDocument.findMany({
      where: { ownerId: req.user!.id },
      orderBy: { uploadedDate: 'desc' },
    });
    res.json(docs);
  } catch (err) {
    console.error('[agent] get documents', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/documents', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { name, vesselId, vesselName, type } = req.body;

    const doc = await prisma.shippingDocument.create({
      data: {
        id: `DOC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        name: name || req.file.originalname,
        vesselId,
        vesselName,
        type,
        status: 'Under Review',
        uploadedDate: new Date().toISOString(),
        fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
        fileUrl: req.file.filename,
        ownerId: req.user!.id,
      }
    });
    res.json(doc);
  } catch (err) {
    console.error('[agent] post documents', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/documents/:id', async (req: Request, res: Response) => {
  try {
    const doc = await prisma.shippingDocument.findUnique({ where: { id: req.params.id } });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.ownerId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    await prisma.shippingDocument.delete({ where: { id: req.params.id } });
    
    // delete physical file
    const filePath = path.join(uploadDir, doc.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('[agent] delete documents/:id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Alerts & Schedules ───────────────────────────────────────────────────────

router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const vessels = await prisma.vessel.findMany({
      where: { ownerId: req.user!.id },
      select: { id: true },
    });
    const vesselIds = vessels.map(v => v.id);

    const alerts = await prisma.operationalAlert.findMany({
      orderBy: { timestamp: 'desc' },
    });
    
    const agentAlerts = alerts.filter(a => {
      let rel = a.relatedEntity as any;
      if (typeof rel === 'string') {
        try { rel = JSON.parse(rel); } catch(e) {}
      }
      return rel && rel.type === 'vessel' && vesselIds.includes(rel.id);
    });

    res.json(agentAlerts);
  } catch (err) {
    console.error('[agent] get alerts', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/schedules', async (req: Request, res: Response) => {
  try {
    const vessels = await prisma.vessel.findMany({
      where: { ownerId: req.user!.id },
      select: { id: true },
    });
    const vesselIds = vessels.map(v => v.id);

    const shiftPlans = await prisma.shiftPlanItem.findMany({
      where: { vesselId: { in: vesselIds } },
      orderBy: [{ dayOffset: 'asc' }, { shift: 'asc' }],
    });
    res.json(shiftPlans);
  } catch (err) {
    console.error('[agent] get schedules', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Profile ──────────────────────────────────────────────────────────────────

router.get('/profile', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('[agent] get profile', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, email },
    });
    res.json(user);
  } catch (err) {
    console.error('[agent] put profile', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
