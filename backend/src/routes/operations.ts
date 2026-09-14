import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import {
  getPortStatus,
  getVessels,
  getVesselById,
  getBerths,
  getBerthById,
  getCranes,
  getCraneById,
  getYardBlocks,
  getLatestForecast,
  getLatestOptimization,
  getLatestSimulation,
  getRoutes,
  getShiftPlans,
  getAlerts,
  getBerthRequests,
} from '../services/operationsService.js';

const router = Router();

// All operations endpoints require admin authentication
router.use(authenticate, requireRole('admin'));

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const VesselsQuerySchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(['Arriving', 'At Anchor', 'Berthing', 'Loading', 'Delayed', 'Completed'])
    .optional(),
  priority: z.enum(['Standard', 'Priority', 'Critical', 'Urgent']).optional(),
});

// ─── GET /port-status ─────────────────────────────────────────────────────────

router.get('/port-status', async (_req: Request, res: Response) => {
  try {
    const data = await getPortStatus();
    res.json(data);
  } catch (err) {
    console.error('[operations] port-status', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /vessels ─────────────────────────────────────────────────────────────

router.get('/vessels', async (req: Request, res: Response) => {
  const parse = VesselsQuerySchema.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid query params', details: parse.error.issues });
    return;
  }
  try {
    const data = await getVessels(parse.data);
    res.json(data);
  } catch (err) {
    console.error('[operations] vessels', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /vessels/:id ─────────────────────────────────────────────────────────

router.get('/vessels/:id', async (req: Request, res: Response) => {
  try {
    const data = await getVesselById(req.params.id);
    if (!data) {
      res.status(404).json({ error: 'Vessel not found' });
      return;
    }
    res.json(data);
  } catch (err) {
    console.error('[operations] vessels/:id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /berths ──────────────────────────────────────────────────────────────

router.get('/berths', async (_req: Request, res: Response) => {
  try {
    const data = await getBerths();
    res.json(data);
  } catch (err) {
    console.error('[operations] berths', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /berths/:id ──────────────────────────────────────────────────────────

router.get('/berths/:id', async (req: Request, res: Response) => {
  try {
    const data = await getBerthById(req.params.id);
    if (!data) {
      res.status(404).json({ error: 'Berth not found' });
      return;
    }
    res.json(data);
  } catch (err) {
    console.error('[operations] berths/:id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /cranes ──────────────────────────────────────────────────────────────

router.get('/cranes', async (_req: Request, res: Response) => {
  try {
    const data = await getCranes();
    res.json(data);
  } catch (err) {
    console.error('[operations] cranes', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /cranes/:id ─────────────────────────────────────────────────────────

router.get('/cranes/:id', async (req: Request, res: Response) => {
  try {
    const data = await getCraneById(req.params.id);
    if (!data) {
      res.status(404).json({ error: 'Crane not found' });
      return;
    }
    res.json(data);
  } catch (err) {
    console.error('[operations] cranes/:id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /yard-blocks ────────────────────────────────────────────────────────

router.get('/yard-blocks', async (_req: Request, res: Response) => {
  try {
    const data = await getYardBlocks();
    res.json(data);
  } catch (err) {
    console.error('[operations] yard-blocks', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /forecast ────────────────────────────────────────────────────────────

router.get('/forecast', async (_req: Request, res: Response) => {
  try {
    const data = await getLatestForecast();
    if (!data) {
      res.status(404).json({ error: 'No forecast data found' });
      return;
    }
    res.json(data);
  } catch (err) {
    console.error('[operations] forecast', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /optimization ───────────────────────────────────────────────────────

router.get('/optimization', async (_req: Request, res: Response) => {
  try {
    const data = await getLatestOptimization();
    if (!data) {
      res.status(404).json({ error: 'No optimization result found' });
      return;
    }
    res.json(data);
  } catch (err) {
    console.error('[operations] optimization', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /simulation ─────────────────────────────────────────────────────────

router.get('/simulation', async (_req: Request, res: Response) => {
  try {
    const data = await getLatestSimulation();
    if (!data) {
      res.status(404).json({ error: 'No simulation result found' });
      return;
    }
    res.json(data);
  } catch (err) {
    console.error('[operations] simulation', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /routes ──────────────────────────────────────────────────────────────

router.get('/routes', async (_req: Request, res: Response) => {
  try {
    const data = await getRoutes();
    res.json(data);
  } catch (err) {
    console.error('[operations] routes', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /shift-plans ────────────────────────────────────────────────────────

router.get('/shift-plans', async (_req: Request, res: Response) => {
  try {
    const data = await getShiftPlans();
    res.json(data);
  } catch (err) {
    console.error('[operations] shift-plans', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /alerts ──────────────────────────────────────────────────────────────

router.get('/alerts', async (_req: Request, res: Response) => {
  try {
    const data = await getAlerts();
    res.json(data);
  } catch (err) {
    console.error('[operations] alerts', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /berth-requests ─────────────────────────────────────────────────────

router.get('/berth-requests', async (_req: Request, res: Response) => {
  try {
    const data = await getBerthRequests();
    res.json(data);
  } catch (err) {
    console.error('[operations] berth-requests', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /optimization/apply ─────────────────────────────────────────────────

router.post('/optimization/apply', async (_req: Request, res: Response) => {
  try {
    const { applyOptimization } = await import('../services/operationsService.js');
    const data = await applyOptimization();
    res.json(data);
  } catch (err) {
    console.error('[operations] optimization/apply', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /simulation/run ─────────────────────────────────────────────────────

const SimulationRunSchema = z.object({
  scenarioType: z.string(),
  targetEntityId: z.string().optional(),
  durationHours: z.number().optional()
});

router.post('/simulation/run', async (req: Request, res: Response) => {
  const parse = SimulationRunSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid request body', details: parse.error.issues });
    return;
  }
  try {
    const { runSimulation } = await import('../services/operationsService.js');
    const data = await runSimulation(parse.data.scenarioType, parse.data.targetEntityId, parse.data.durationHours);
    res.json(data);
  } catch (err) {
    console.error('[operations] simulation/run', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /recovery-plan/apply ────────────────────────────────────────────────

router.post('/recovery-plan/apply', async (_req: Request, res: Response) => {
  try {
    const { applyRecoveryPlan } = await import('../services/operationsService.js');
    const data = await applyRecoveryPlan();
    res.json(data);
  } catch (err) {
    console.error('[operations] recovery-plan/apply', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /alerts/:id/resolve ─────────────────────────────────────────────────

router.post('/alerts/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { resolveAlert } = await import('../services/operationsService.js');
    const data = await resolveAlert(req.params.id);
    res.json(data);
  } catch (err) {
    console.error('[operations] alerts/:id/resolve', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PUT /vessels/:id/reassign ────────────────────────────────────────────────

const ReassignVesselSchema = z.object({
  berthId: z.string(),
});

router.put('/vessels/:id/reassign', async (req: Request, res: Response) => {
  const parse = ReassignVesselSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid request body', details: parse.error.issues });
    return;
  }
  try {
    const { reassignVesselBerth } = await import('../services/operationsService.js');
    const data = await reassignVesselBerth(req.params.id, parse.data.berthId);
    res.json(data);
  } catch (err) {
    console.error('[operations] vessels/:id/reassign', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PUT /vessels/:id ─────────────────────────────────────────────────────────

router.put('/vessels/:id', async (req: Request, res: Response) => {
  try {
    const { updateVessel } = await import('../services/operationsService.js');
    const data = await updateVessel(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    console.error('[operations] vessels/:id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PUT /berth-requests/:id/status ───────────────────────────────────────────

const BerthRequestStatusSchema = z.object({
  status: z.string(),
  assignedBerth: z.string().optional(),
  notes: z.string().optional()
});

router.put('/berth-requests/:id/status', async (req: Request, res: Response) => {
  const parse = BerthRequestStatusSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid request body', details: parse.error.issues });
    return;
  }
  try {
    const { updateBerthRequestStatus } = await import('../services/operationsService.js');
    const data = await updateBerthRequestStatus(req.params.id, parse.data.status, parse.data.assignedBerth, parse.data.notes);
    res.json(data);
  } catch (err) {
    console.error('[operations] berth-requests/:id/status', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
