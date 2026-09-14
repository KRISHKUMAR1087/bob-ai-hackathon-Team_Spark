import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Vessels ─────────────────────────────────────────────────────────────────

export async function getVessels(opts: {
  search?: string;
  status?: string;
  priority?: string;
}) {
  const where: Prisma.VesselWhereInput = {};

  if (opts.status) {
    // Map wire value to DB enum value (handle "At Anchor" → "At_Anchor")
    const statusMap: Record<string, string> = {
      Arriving: 'Arriving',
      'At Anchor': 'At_Anchor',
      Berthing: 'Berthing',
      Loading: 'Loading',
      Delayed: 'Delayed',
      Completed: 'Completed',
    };
    const mapped = statusMap[opts.status];
    if (mapped) where.status = mapped as string;
  }

  if (opts.priority) {
    where.priority = opts.priority as string;
  }

  if (opts.search) {
    const s = opts.search;
    where.OR = [
      { name: { contains: s } },
      { imo: { contains: s } },
      { origin: { contains: s } },
      { assignedBerth: { contains: s } },
    ];
  }

  const rows = await prisma.vessel.findMany({
    where,
    include: { timelineEvents: true },
    orderBy: { predictedWaitHours: 'desc' },
  });

  return rows.map(normalizeVessel);
}

export async function getVesselById(id: string) {
  const row = await prisma.vessel.findUnique({
    where: { id },
    include: { timelineEvents: true },
  });
  if (!row) return null;
  return normalizeVessel(row);
}

export function normalizeVessel(
  row: Prisma.VesselGetPayload<{ include: { timelineEvents: true } }>
) {
  return {
    id: row.id,
    name: row.name,
    imo: row.imo,
    flag: row.flag,
    lengthMeters: row.lengthMeters,
    draughtMeters: row.draughtMeters,
    teuCapacity: row.teuCapacity,
    cargoVolume: row.cargoVolume,
    origin: row.origin,
    destination: row.destination,
    eta: row.eta,
    etd: row.etd,
    // Remap enum "At_Anchor" → "At Anchor" for the wire format
    status: row.status === 'At_Anchor' ? 'At Anchor' : (row.status as string),
    priority: row.priority as string,
    currentBerth: row.currentBerth,
    assignedBerth: row.assignedBerth,
    predictedWaitHours: row.predictedWaitHours,
    demurrageRisk: row.demurrageRisk,
    historicalTurnaroundHours: row.historicalTurnaroundHours,
    recommendedAction: row.recommendedAction ?? undefined,
    ownerId: row.ownerId ?? undefined,
    shippingCompany: row.shippingCompany ?? undefined,
    callSign: row.callSign ?? undefined,
    vesselType: row.vesselType ?? undefined,
    voyageNumber: row.voyageNumber ?? undefined,
    previousPort: row.previousPort ?? undefined,
    nextPort: row.nextPort ?? undefined,
    requestedBerth: row.requestedBerth ?? undefined,
    requestedArrivalTime: row.requestedArrivalTime ?? undefined,
    berthDurationHours: row.berthDurationHours ?? undefined,
    requestedCranes: row.requestedCranes ?? undefined,
    cargoType: row.cargoType ?? undefined,
    cargoQuantity: row.cargoQuantity ?? undefined,
    containersLoaded: row.containersLoaded ?? undefined,
    containersTotal: row.containersTotal ?? undefined,
    dangerousGoods: row.dangerousGoods ?? undefined,
    specialNotes: row.specialNotes ?? undefined,
    timelineEvents: row.timelineEvents.map(e => ({
      stage: e.stage,
      time: e.time,
      status: e.status,
    })),
  };
}

// ─── Berths ───────────────────────────────────────────────────────────────────

export async function getBerths() {
  const rows = await prisma.berth.findMany({
    include: {
      hourlyForecasts: true,
      craneAssignments: true,
    },
    orderBy: { id: 'asc' },
  });
  return rows.map(normalizeBerth);
}

export async function getBerthById(id: string) {
  const row = await prisma.berth.findUnique({
    where: { id },
    include: {
      hourlyForecasts: true,
      craneAssignments: true,
    },
  });
  if (!row) return null;
  return normalizeBerth(row);
}

function normalizeBerth(
  row: Prisma.BerthGetPayload<{ include: { hourlyForecasts: true; craneAssignments: true } }>
) {
  return {
    id: row.id,
    name: row.name,
    lengthMeters: row.lengthMeters,
    depthMeters: row.depthMeters,
    maxDraftMeters: row.maxDraftMeters,
    status: row.status as string,
    currentUtilization: row.currentUtilization,
    predictedUtilization: row.predictedUtilization,
    queueCount: row.queueCount,
    availableCranes: row.availableCranes,
    maxCranes: row.maxCranes,
    currentVesselId: row.currentVesselId,
    nextVesselId: row.nextVesselId,
    riskLevel: row.riskLevel,
    assignedCraneIds: row.craneAssignments.map(ca => ca.craneId),
    hourlyForecast: row.hourlyForecasts.map(hf => ({
      hour: hf.hour,
      utilization: hf.utilization,
    })),
  };
}

// ─── Cranes ───────────────────────────────────────────────────────────────────

export async function getCranes() {
  const rows = await prisma.crane.findMany({ orderBy: { id: 'asc' } });
  return rows.map(normalizeCrane);
}

export async function getCraneById(id: string) {
  const row = await prisma.crane.findUnique({ where: { id } });
  if (!row) return null;
  return normalizeCrane(row);
}

function normalizeCrane(row: Prisma.CraneGetPayload<object>) {
  return {
    id: row.id,
    name: row.name,
    type: row.type as string,
    status: row.status as string,
    berthId: row.berthId,
    movesPerHour: row.movesPerHour,
    utilizationPercent: row.utilizationPercent,
    failureDurationHours: row.failureDurationHours ?? undefined,
    impactSeverity: row.impactSeverity ?? undefined,
    assignedVesselId: row.assignedVesselId ?? null,
    lastMaintenance: row.lastMaintenance,
    nextMaintenance: row.nextMaintenance,
  };
}

// ─── Yard Blocks ──────────────────────────────────────────────────────────────

export async function getYardBlocks() {
  const rows = await prisma.yardBlock.findMany({ orderBy: { id: 'asc' } });
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    category: row.category as string,
    totalTeu: row.totalTeu,
    occupiedTeu: row.occupiedTeu,
    utilizationPercent: row.utilizationPercent,
    dwellTimeDays: row.dwellTimeDays,
    inboundTeu24h: row.inboundTeu24h,
    outboundTeu24h: row.outboundTeu24h,
    congestionRisk: row.congestionRisk,
    suggestedRedistribution: row.suggestedRedistribution ?? null,
  }));
}

// ─── Forecast ─────────────────────────────────────────────────────────────────

export async function getLatestForecast() {
  const row = await prisma.congestionForecast.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { drivers: true, points: true },
  });
  if (!row) return null;

  return {
    timeHorizon: row.timeHorizon,
    overallCongestionPercent: row.overallCongestionPercent,
    riskBottleneckBerth: row.riskBottleneckBerth,
    bottleneckConfidence: row.bottleneckConfidence,
    drivers: row.drivers.map(d => ({
      factor: d.factor,
      percentage: d.percentage,
      impact: d.impact,
      detail: d.detail,
    })),
    points: row.points.map(p => {
      const bd = JSON.parse(p.berthData) as Record<string, number>;
      return {
        hour: p.hour,
        B01: bd['B01'] ?? 0,
        B02: bd['B02'] ?? 0,
        B03: bd['B03'] ?? 0,
        B04: bd['B04'] ?? 0,
        B05: bd['B05'] ?? 0,
        B06: bd['B06'] ?? 0,
        threshold: p.threshold,
      };
    }),
  };
}

// ─── Optimization ─────────────────────────────────────────────────────────────

export async function getLatestOptimization() {
  const row = await prisma.optimizationResult.findFirst({
    orderBy: { timestamp: 'desc' },
  });
  if (!row) return null;
  return {
    id: row.id,
    timestamp: row.timestamp,
    isApplied: row.isApplied,
    targetVesselId: row.targetVesselId,
    currentPlan: row.currentPlan,
    optimizedPlan: row.optimizedPlan,
    waitTimeDeltaHours: row.waitTimeDeltaHours,
    waitTimeReductionPercent: row.waitTimeReductionPercent,
    queueReductionCount: row.queueReductionCount,
    savingsEstimateUsd: row.savingsEstimateUsd,
    rationale: row.rationale,
  };
}

// ─── Simulation ───────────────────────────────────────────────────────────────

export async function getLatestSimulation() {
  const row = await prisma.simulationResult.findFirst();
  if (!row) return null;
  return {
    id: row.id,
    scenario: row.scenario,
    before: row.before,
    after: row.after,
    recoveryPlan: row.recoveryPlan,
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function getRoutes() {
  return prisma.routeOption.findMany({ orderBy: { distanceNm: 'asc' } });
}

// ─── Shift Plans ──────────────────────────────────────────────────────────────

export async function getShiftPlans() {
  const rows = await prisma.shiftPlanItem.findMany({
    orderBy: [{ dayOffset: 'asc' }, { shift: 'asc' }],
  });
  return rows.map(row => ({
    id: row.id,
    dayOffset: row.dayOffset,
    shift: row.shift,
    berthId: row.berthId,
    vesselId: row.vesselId,
    vesselName: row.vesselName,
    assignedCranes: JSON.parse(row.assignedCranes) as string[],
    status: row.status,
    conflictReason: row.conflictReason ?? undefined,
  }));
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function getAlerts() {
  const rows = await prisma.operationalAlert.findMany({
    orderBy: [
      { isResolved: 'asc' }, // unresolved (false) first
      { timestamp: 'desc' },
    ],
  });
  return rows.map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    severity: row.severity as string,
    title: row.title,
    description: row.description,
    relatedEntity: row.relatedEntity,
    isResolved: row.isResolved,
    actionRoute: row.actionRoute,
    actionLabel: row.actionLabel,
  }));
}

// ─── Berth Requests ───────────────────────────────────────────────────────────

export async function getBerthRequests() {
  const rows = await prisma.berthRequest.findMany({
    orderBy: { submittedAt: 'desc' },
  });
  return rows.map(row => ({
    id: row.id,
    vesselId: row.vesselId,
    vesselName: row.vesselName,
    imo: row.imo,
    requestedBerth: row.requestedBerth,
    requestedArrivalTime: row.requestedArrivalTime,
    estimatedDurationHours: row.estimatedDurationHours,
    requestedCranes: row.requestedCranes,
    cargoType: row.cargoType,
    // Map DB enum to wire format: Under_Review → "Under Review"
    status: (row.status as string).replace('_', ' '),
    submittedAt: row.submittedAt,
    reviewedAt: row.reviewedAt ?? undefined,
    assignedBerth: row.assignedBerth ?? undefined,
    notes: row.notes ?? undefined,
    ownerId: row.ownerId,
  }));
}

// ─── Port Status (dashboard aggregate) ───────────────────────────────────────

export async function getPortStatus() {
  const [vessels, berths, cranes, yardBlocks, forecast] = await Promise.all([
    prisma.vessel.findMany({ select: { status: true } }),
    prisma.berth.findMany({ select: { currentUtilization: true, queueCount: true, riskLevel: true, name: true } }),
    prisma.crane.findMany({ select: { status: true } }),
    prisma.yardBlock.findMany({ select: { occupiedTeu: true, totalTeu: true } }),
    prisma.congestionForecast.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { overallCongestionPercent: true, riskBottleneckBerth: true },
    }),
  ]);

  const vesselCount = vessels.filter(v =>
    v.status === 'Berthing' || v.status === 'Loading'
  ).length;

  const avgBerthUtil =
    berths.length > 0
      ? Math.round(berths.reduce((acc, b) => acc + b.currentUtilization, 0) / berths.length)
      : 0;

  const craneAvailabilityCount = cranes.filter(c => c.status === 'ACTIVE').length;

  const totalOccupied = yardBlocks.reduce((acc, y) => acc + y.occupiedTeu, 0);
  const totalCap = yardBlocks.reduce((acc, y) => acc + y.totalTeu, 0);
  const avgYardUtil = totalCap > 0 ? Math.round((totalOccupied / totalCap) * 100) : 0;

  const queueTotal = berths.reduce((acc, b) => acc + b.queueCount, 0);

  const predictedCongestionLevel = forecast?.overallCongestionPercent ?? 0;
  const highRiskBerth = berths.find(b => b.riskLevel === 'HIGH')?.name ?? null;

  return {
    vesselCount,
    avgBerthUtil,
    craneAvailabilityCount,
    avgYardUtil,
    queueTotal,
    predictedCongestionLevel,
    highRiskBerth,
  };
}
// === Mutations ===

export async function applyOptimization() {
  const latestOpt = await prisma.optimizationResult.findFirst({
    orderBy: { timestamp: 'desc' },
  });
  if (!latestOpt) throw new Error('No optimization found');

  return prisma.$transaction(async (tx) => {
    const updatedOpt = await tx.optimizationResult.update({
      where: { id: latestOpt.id },
      data: { isApplied: true },
    });

    await tx.vessel.update({
      where: { id: 'VES-01' },
      data: {
        assignedBerth: 'B02',
        predictedWaitHours: 6.8,
        demurrageRisk: 'Low',
        recommendedAction: 'Optimized: Assigned to B02 with 4 STS cranes (Wait reduced to 6.8h).',
      }
    });

    await tx.berth.update({
      where: { id: 'B04' },
      data: {
        status: 'Occupied',
        currentUtilization: 76,
        predictedUtilization: 78,
        queueCount: 4,
        riskLevel: 'LOW',
        nextVesselId: null,
      }
    });

    await tx.berth.update({
      where: { id: 'B02' },
      data: {
        predictedUtilization: 74,
        queueCount: 3,
        nextVesselId: 'VES-01',
      }
    });

    // Update Shift Plans (resolve conflict)
    const sps = await tx.shiftPlanItem.findMany({ where: { vesselId: 'VES-01' } });
    if (sps.length > 0) {
      await tx.shiftPlanItem.update({
        where: { id: sps[0].id },
        data: {
          berthId: 'B02',
          status: 'Optimized',
          assignedCranes: JSON.stringify(['C04', 'C06']),
          conflictReason: null,
        }
      });
    }

    // Update Berth Request
    const brs = await tx.berthRequest.findMany({ where: { vesselId: 'VES-01' } });
    if (brs.length > 0) {
      await tx.berthRequest.update({
        where: { id: brs[0].id },
        data: {
          status: 'Changed',
          assignedBerth: 'B02',
          reviewedAt: new Date().toISOString(),
          notes: 'Optimized by Port Operations: Reallocated to Berth B02 with 4 STS cranes (Wait reduced to 6.8h).',
        }
      });
    }

    return updatedOpt;
  });
}

export async function runSimulation(scenarioType: string, targetEntityId?: string, durationHours?: number) {
  const sim = await prisma.simulationResult.create({
    data: {
      scenario: JSON.stringify({
        type: scenarioType,
        durationHours: durationHours || 8,
      }),
      before: JSON.stringify({
        queueCount: 7,
        avgWaitHours: 11.4,
        berthUtilizationPercent: 78,
      }),
      after: JSON.stringify({
        queueCount: 11,
        avgWaitHours: 17.8,
        berthUtilizationPercent: 94,
      }),
      recoveryPlan: JSON.stringify({
        isApplied: false,
        steps: [
          'Move C05 to B04',
          'Reassign Ocean Star to B02'
        ]
      })
    }
  });
  return sim;
}

export async function applyRecoveryPlan() {
  const latestSim = await prisma.simulationResult.findFirst({
    orderBy: { id: 'desc' }
  });
  if (!latestSim) throw new Error('No simulation found');

  return prisma.$transaction(async (tx) => {
    const currentRec = latestSim.recoveryPlan as any;
    currentRec.isApplied = true;
    await tx.simulationResult.update({
      where: { id: latestSim.id },
      data: { recoveryPlan: currentRec }
    });

    await tx.crane.update({
      where: { id: 'C05' },
      data: {
        berthId: 'B04',
        status: 'ACTIVE',
        movesPerHour: 30,
        utilizationPercent: 85,
      }
    });

    await tx.vessel.update({
      where: { id: 'VES-01' },
      data: {
        assignedBerth: 'B02',
        predictedWaitHours: 6.8,
        demurrageRisk: 'Low',
      }
    });

    await tx.vessel.update({
      where: { id: 'VES-05' },
      data: {
        eta: 'Tomorrow, 20:45 UTC (+4h buffer)',
        predictedWaitHours: 4.2,
      }
    });

    await tx.berth.update({
      where: { id: 'B04' },
      data: {
        availableCranes: 2,
        currentUtilization: 74,
        predictedUtilization: 76,
        queueCount: 4,
        riskLevel: 'LOW',
      }
    });

    await tx.berth.update({
      where: { id: 'B02' },
      data: {
        availableCranes: 4,
        predictedUtilization: 78,
      }
    });

    return true;
  });
}

export async function resolveAlert(id: string) {
  return prisma.operationalAlert.update({
    where: { id },
    data: { isResolved: true }
  });
}

export async function reassignVesselBerth(id: string, berthId: string) {
  return prisma.$transaction(async (tx) => {
    const vessel = await tx.vessel.update({
      where: { id },
      data: {
        assignedBerth: berthId,
        predictedWaitHours: 1.5,
        demurrageRisk: 'Low',
      }
    });

    const brs = await tx.berthRequest.findMany({ where: { vesselId: id } });
    if (brs.length > 0) {
      await tx.berthRequest.update({
        where: { id: brs[0].id },
        data: {
          status: 'Approved',
          assignedBerth: berthId,
          reviewedAt: new Date().toISOString(),
        }
      });
    }
    return vessel;
  });
}

export async function updateVessel(id: string, data: any) {
  return prisma.vessel.update({
    where: { id },
    data
  });
}

export async function updateBerthRequestStatus(id: string, status: string, assignedBerth?: string, notes?: string) {
  return prisma.$transaction(async (tx) => {
    // Determine the Enum value for status
    const statusEnum = status.replace(' ', '_') as any;
    const req = await tx.berthRequest.update({
      where: { id },
      data: {
        status: statusEnum,
        ...(assignedBerth ? { assignedBerth } : {}),
        ...(notes ? { notes } : {}),
        reviewedAt: new Date().toISOString()
      }
    });

    if (assignedBerth) {
      await tx.vessel.update({
        where: { id: req.vesselId },
        data: { assignedBerth }
      });
    }

    return req;
  });
}
