import { Hono } from 'hono';
import { z } from 'zod';
import { authenticate, Env } from '../middleware/authenticate.js';
import { geminiCopilotService } from '../services/copilotService.js';
import {
  getVessels,
  getBerths,
  getCranes,
  getYardBlocks,
  getLatestForecast,
  getLatestOptimization,
  getLatestSimulation,
  getRoutes,
  getShiftPlans,
  getAlerts,
  getBerthRequests,
  normalizeVessel
} from '../services/operationsService.js';

const router = new Hono<Env>();

router.use('*', authenticate);

const QuerySchema = z.object({
  userQuery: z.string().min(1),
  contextHints: z.any().optional(),
});

router.post('/query', async (c) => {
  const body = await c.req.json();
  const parse = QuerySchema.safeParse(body);
  if (!parse.success) {
    return c.json({ error: 'Invalid body', details: parse.error.issues }, 400);
  }

  const { userQuery, contextHints } = parse.data;
  const user = c.var.user;
  const prisma = c.var.prisma;
  const apiKey = c.env.GEMINI_API_KEY;

  try {
    if (user.role === 'admin') {
      const [
        vessels, berths, cranes, yardBlocks, forecast, optimization,
        simulation, routes, shiftPlans, alerts, berthRequests
      ] = await Promise.all([
        getVessels({}),
        getBerths(),
        getCranes(),
        getYardBlocks(),
        getLatestForecast(),
        getLatestOptimization(),
        getLatestSimulation(),
        getRoutes(),
        getShiftPlans(),
        getAlerts(),
        getBerthRequests()
      ]);

      const context = {
        vessels, berths, cranes, yardBlocks, forecast: forecast || undefined,
        optimization: optimization || undefined, simulation: simulation || undefined,
        routes, shiftPlans, alerts, berthRequests,
        isOptimizationApplied: !!(optimization as any)?.isApplied,
        isRecoveryPlanApplied: !!(simulation as any)?.recoveryPlan?.isApplied,
        conversationHistory: contextHints?.conversationHistory || [],
      };

      process.env.GEMINI_API_KEY = apiKey;
      const response = await geminiCopilotService.processUserQuery(userQuery, context as any);
      return c.json(response);

    } else {
      // Ship Agent
      const vessels = await prisma.vessel.findMany({
        where: { ownerId: user.id },
        include: { timelineEvents: true }
      });
      const berthRequests = await prisma.berthRequest.findMany({
        where: { ownerId: user.id }
      });
      const docs = await prisma.shippingDocument.findMany({
        where: { ownerId: user.id }
      });

      const context = {
        vessels: vessels.map(normalizeVessel),
        berthRequests: berthRequests.map(r => ({ ...r, status: r.status as string })),
        shippingDocuments: docs.map(d => ({ ...d, status: d.status as string })),
        agentName: user.name || user.email,
        conversationHistory: contextHints?.conversationHistory || [],
      };

      process.env.GEMINI_API_KEY = apiKey;
      const responseText = await geminiCopilotService.processShipAgentQuery(userQuery, context as any);
      return c.json({
        id: 'msg-' + Date.now(),
        sender: 'gemini',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      });
    }
  } catch (err) {
    console.error('[copilot] query', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

router.post('/query-stream', async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch(e) {
    return c.text(`data: ${JSON.stringify({ error: 'Invalid body' })}\n\n`, 400, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
  }

  const parse = QuerySchema.safeParse(body);
  if (!parse.success) {
    return c.text(`data: ${JSON.stringify({ error: 'Invalid body' })}\n\n`, 400, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
  }
  
  try {
    return c.text(`data: ${JSON.stringify({ message: "Streaming not fully implemented in demo, fallback to blocking" })}\n\n`, 200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
  } catch (err) {
    console.error('[copilot] query-stream', err);
    return c.text('', 500);
  }
});

export default router;
