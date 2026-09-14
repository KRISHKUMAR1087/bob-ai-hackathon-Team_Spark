import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../middleware/authenticate.js';
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

const router = new Hono<Env>();

// All operations endpoints require admin authentication
router.use('/*', authenticate, requireRole('admin'));

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const VesselsQuerySchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(['Arriving', 'At Anchor', 'Berthing', 'Loading', 'Delayed', 'Completed'])
    .optional(),
  priority: z.enum(['Standard', 'Priority', 'Critical', 'Urgent']).optional(),
});

// ─── GET /port-status ─────────────────────────────────────────────────────────

router.get('/port-status', async (c) => {
  try {
    const data = await getPortStatus();
    return c.json(data);
  } catch (err) {
    console.error('[operations] port-status', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /vessels ─────────────────────────────────────────────────────────────

router.get('/vessels', async (c) => {
  const query = c.req.query();
  const parse = VesselsQuerySchema.safeParse(query);
  if (!parse.success) {
    return c.json({ error: 'Invalid query params', details: parse.error.issues }, 400);
  }
  try {
    const data = await getVessels(parse.data);
    return c.json(data);
  } catch (err) {
    console.error('[operations] vessels', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /vessels/:id ─────────────────────────────────────────────────────────

router.get('/vessels/:id', async (c) => {
  try {
    const data = await getVesselById(c.req.param('id'));
    if (!data) {
      return c.json({ error: 'Vessel not found' }, 404);
    }
    return c.json(data);
  } catch (err) {
    console.error('[operations] vessels/:id', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /berths ──────────────────────────────────────────────────────────────

router.get('/berths', async (c) => {
  try {
    const data = await getBerths();
    return c.json(data);
  } catch (err) {
    console.error('[operations] berths', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /berths/:id ──────────────────────────────────────────────────────────

router.get('/berths/:id', async (c) => {
  try {
    const data = await getBerthById(c.req.param('id'));
    if (!data) {
      return c.json({ error: 'Berth not found' }, 404);
    }
    return c.json(data);
  } catch (err) {
    console.error('[operations] berths/:id', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /cranes ──────────────────────────────────────────────────────────────

router.get('/cranes', async (c) => {
  try {
    const data = await getCranes();
    return c.json(data);
  } catch (err) {
    console.error('[operations] cranes', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /cranes/:id ─────────────────────────────────────────────────────────

router.get('/cranes/:id', async (c) => {
  try {
    const data = await getCraneById(c.req.param('id'));
    if (!data) {
      return c.json({ error: 'Crane not found' }, 404);
    }
    return c.json(data);
  } catch (err) {
    console.error('[operations] cranes/:id', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /yard-blocks ────────────────────────────────────────────────────────

router.get('/yard-blocks', async (c) => {
  try {
    const data = await getYardBlocks();
    return c.json(data);
  } catch (err) {
    console.error('[operations] yard-blocks', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /forecast ────────────────────────────────────────────────────────────

router.get('/forecast', async (c) => {
  try {
    const data = await getLatestForecast();
    if (!data) {
      return c.json({ error: 'No forecast data found' }, 404);
    }
    return c.json(data);
  } catch (err) {
    console.error('[operations] forecast', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /optimization ───────────────────────────────────────────────────────

router.get('/optimization', async (c) => {
  try {
    const data = await getLatestOptimization();
    if (!data) {
      return c.json({ error: 'No optimization result found' }, 404);
    }
    return c.json(data);
  } catch (err) {
    console.error('[operations] optimization', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /simulation ─────────────────────────────────────────────────────────

router.get('/simulation', async (c) => {
  try {
    const data = await getLatestSimulation();
    if (!data) {
      return c.json({ error: 'No simulation result found' }, 404);
    }
    return c.json(data);
  } catch (err) {
    console.error('[operations] simulation', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /routes ──────────────────────────────────────────────────────────────

router.get('/routes', async (c) => {
  try {
    const data = await getRoutes();
    return c.json(data);
  } catch (err) {
    console.error('[operations] routes', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /shift-plans ────────────────────────────────────────────────────────

router.get('/shift-plans', async (c) => {
  try {
    const data = await getShiftPlans();
    return c.json(data);
  } catch (err) {
    console.error('[operations] shift-plans', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /alerts ──────────────────────────────────────────────────────────────

router.get('/alerts', async (c) => {
  try {
    const data = await getAlerts();
    return c.json(data);
  } catch (err) {
    console.error('[operations] alerts', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── GET /berth-requests ─────────────────────────────────────────────────────

router.get('/berth-requests', async (c) => {
  try {
    const data = await getBerthRequests();
    return c.json(data);
  } catch (err) {
    console.error('[operations] berth-requests', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── POST /optimization/apply ─────────────────────────────────────────────────

router.post('/optimization/apply', async (c) => {
  try {
    const { applyOptimization } = await import('../services/operationsService.js');
    const data = await applyOptimization();
    return c.json(data);
  } catch (err) {
    console.error('[operations] optimization/apply', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── POST /simulation/run ─────────────────────────────────────────────────────

const SimulationRunSchema = z.object({
  scenarioType: z.string(),
  targetEntityId: z.string().optional(),
  durationHours: z.number().optional()
});

router.post('/simulation/run', async (c) => {
  const body = await c.req.json();
  const parse = SimulationRunSchema.safeParse(body);
  if (!parse.success) {
    return c.json({ error: 'Invalid request body', details: parse.error.issues }, 400);
  }
  try {
    const { runSimulation } = await import('../services/operationsService.js');
    const data = await runSimulation(parse.data.scenarioType, parse.data.targetEntityId, parse.data.durationHours);
    return c.json(data);
  } catch (err) {
    console.error('[operations] simulation/run', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── POST /recovery-plan/apply ────────────────────────────────────────────────

router.post('/recovery-plan/apply', async (c) => {
  try {
    const { applyRecoveryPlan } = await import('../services/operationsService.js');
    const data = await applyRecoveryPlan();
    return c.json(data);
  } catch (err) {
    console.error('[operations] recovery-plan/apply', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── POST /alerts/:id/resolve ─────────────────────────────────────────────────

router.post('/alerts/:id/resolve', async (c) => {
  try {
    const { resolveAlert } = await import('../services/operationsService.js');
    const data = await resolveAlert(c.req.param('id'));
    return c.json(data);
  } catch (err) {
    console.error('[operations] alerts/:id/resolve', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── PUT /vessels/:id/reassign ────────────────────────────────────────────────

const ReassignVesselSchema = z.object({
  berthId: z.string(),
});

router.put('/vessels/:id/reassign', async (c) => {
  const body = await c.req.json();
  const parse = ReassignVesselSchema.safeParse(body);
  if (!parse.success) {
    return c.json({ error: 'Invalid request body', details: parse.error.issues }, 400);
  }
  try {
    const { reassignVesselBerth } = await import('../services/operationsService.js');
    const data = await reassignVesselBerth(c.req.param('id'), parse.data.berthId);
    return c.json(data);
  } catch (err) {
    console.error('[operations] vessels/:id/reassign', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── PUT /vessels/:id ─────────────────────────────────────────────────────────

router.put('/vessels/:id', async (c) => {
  try {
    const body = await c.req.json();
    const { updateVessel } = await import('../services/operationsService.js');
    const data = await updateVessel(c.req.param('id'), body);
    return c.json(data);
  } catch (err) {
    console.error('[operations] vessels/:id', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── PUT /berth-requests/:id/status ───────────────────────────────────────────

const BerthRequestStatusSchema = z.object({
  status: z.string(),
  assignedBerth: z.string().optional(),
  notes: z.string().optional()
});

router.put('/berth-requests/:id/status', async (c) => {
  const body = await c.req.json();
  const parse = BerthRequestStatusSchema.safeParse(body);
  if (!parse.success) {
    return c.json({ error: 'Invalid request body', details: parse.error.issues }, 400);
  }
  try {
    const { updateBerthRequestStatus } = await import('../services/operationsService.js');
    const data = await updateBerthRequestStatus(c.req.param('id'), parse.data.status, parse.data.assignedBerth, parse.data.notes);
    return c.json(data);
  } catch (err) {
    console.error('[operations] berth-requests/:id/status', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default router;
