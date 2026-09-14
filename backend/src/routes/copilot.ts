import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
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
  getBerthRequests
} from '../services/operationsService.js';
import { PrismaClient } from '@prisma/client';
import { normalizeVessel } from '../services/operationsService.js';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);

const QuerySchema = z.object({
  userQuery: z.string().min(1),
  contextHints: z.any().optional(),
});

router.post('/query', async (req: Request, res: Response) => {
  const parse = QuerySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid body', details: parse.error.issues });
  }

  const { userQuery, contextHints } = parse.data;

  try {
    if (req.user!.role === 'admin') {
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
        isOptimizationApplied: optimization?.isApplied || false,
        isRecoveryPlanApplied: !!simulation?.recoveryPlan?.isApplied,
        conversationHistory: contextHints?.conversationHistory || [],
      };

      const response = await geminiCopilotService.processUserQuery(userQuery, context);
      res.json(response);

    } else {
      // Ship Agent
      const vessels = await prisma.vessel.findMany({
        where: { ownerId: req.user!.id },
        include: { timelineEvents: true }
      });
      const berthRequests = await prisma.berthRequest.findMany({
        where: { ownerId: req.user!.id }
      });
      const docs = await prisma.shippingDocument.findMany({
        where: { ownerId: req.user!.id }
      });

      const context = {
        vessels: vessels.map(normalizeVessel),
        berthRequests: berthRequests.map(r => ({ ...r, status: r.status as string })),
        shippingDocuments: docs.map(d => ({ ...d, status: d.status as string })),
        agentName: req.user!.name || req.user!.email,
        conversationHistory: contextHints?.conversationHistory || [],
      };

      const responseText = await geminiCopilotService.processShipAgentQuery(userQuery, context as any);
      res.json({
        id: 'msg-' + Date.now(),
        sender: 'gemini',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      });
    }
  } catch (err) {
    console.error('[copilot] query', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/query-stream', async (req: Request, res: Response) => {
  // Setup SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const parse = QuerySchema.safeParse(req.body);
  if (!parse.success) {
    res.write(`data: ${JSON.stringify({ error: 'Invalid body' })}\n\n`);
    res.end();
    return;
  }
  
  // Right now, just calling the blocking route for simplicity
  // A true streaming implementation would call model.generateContentStream
  try {
    // mock streaming
    res.write(`data: ${JSON.stringify({ message: "Streaming not fully implemented in demo, fallback to blocking" })}\n\n`);
    res.end();
  } catch (err) {
    console.error('[copilot] query-stream', err);
    res.end();
  }
});

export default router;
