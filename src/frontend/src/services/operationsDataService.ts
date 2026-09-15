import { supabase } from '../lib/supabase';
import {
  Berth,
  BerthRequest,
  BerthRequestStatus,
  CongestionForecastData,
  Crane,
  OperationalAlert,
  OptimizationResult,
  PriorityLevel,
  RouteOption,
  ShiftPlanItem,
  SimulationResult,
  Vessel,
  VesselStatus,
  YardBlock,
} from '../types/operations';

type VesselRow = Omit<Vessel, 'timelineEvents'>;

const defaultTimeline = (vessel: Pick<Vessel, 'eta'>) => [
  { stage: 'Port Notice Filed', time: 'Submitted', status: 'completed' as const },
  { stage: 'Pilot Station Entry', time: vessel.eta, status: 'scheduled' as const },
  { stage: 'Berthing', time: '+1h after pilot', status: 'scheduled' as const },
];

const parseJsonSafe = (val: any, fallback: any = null) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

const toVessel = (row: any): Vessel => ({
  id: row.id,
  name: row.name,
  imo: row.imo,
  flag: row.flag,
  lengthMeters: Number(row.lengthMeters),
  draughtMeters: Number(row.draughtMeters),
  teuCapacity: Number(row.teuCapacity),
  cargoVolume: Number(row.cargoVolume),
  origin: row.origin,
  destination: row.destination,
  eta: row.eta,
  etd: row.etd,
  status: row.status as VesselStatus,
  priority: row.priority as PriorityLevel,
  currentBerth: row.currentBerth,
  assignedBerth: row.assignedBerth,
  predictedWaitHours: Number(row.predictedWaitHours),
  demurrageRisk: row.demurrageRisk,
  historicalTurnaroundHours: Number(row.historicalTurnaroundHours),
  recommendedAction: row.recommendedAction,
  ownerId: row.ownerId,
  shippingCompany: row.shippingCompany,
  callSign: row.callSign,
  vesselType: row.vesselType,
  voyageNumber: row.voyageNumber,
  previousPort: row.previousPort,
  nextPort: row.nextPort,
  requestedBerth: row.requestedBerth,
  requestedArrivalTime: row.requestedArrivalTime,
  berthDurationHours: row.berthDurationHours == null ? undefined : Number(row.berthDurationHours),
  requestedCranes: row.requestedCranes == null ? undefined : Number(row.requestedCranes),
  cargoType: row.cargoType,
  cargoQuantity: row.cargoQuantity,
  containersLoaded: row.containersLoaded == null ? undefined : Number(row.containersLoaded),
  containersTotal: row.containersTotal == null ? undefined : Number(row.containersTotal),
  dangerousGoods: Boolean(row.dangerousGoods),
  specialNotes: row.specialNotes,
  timelineEvents: defaultTimeline(row),
});

const toVesselRow = (vessel: Vessel): VesselRow => {
  const { timelineEvents: _timelineEvents, ...row } = vessel;
  return row;
};

const toBerthRequest = (row: any): BerthRequest => ({
  id: row.id,
  vesselId: row.vesselId,
  vesselName: row.vesselName,
  imo: row.imo,
  requestedBerth: row.requestedBerth,
  requestedArrivalTime: row.requestedArrivalTime,
  estimatedDurationHours: Number(row.estimatedDurationHours),
  requestedCranes: Number(row.requestedCranes),
  cargoType: row.cargoType,
  status: row.status as BerthRequestStatus,
  submittedAt: row.submittedAt,
  reviewedAt: row.reviewedAt,
  assignedBerth: row.assignedBerth,
  notes: row.notes,
  ownerId: row.ownerId,
});

const toBerth = (row: any): Berth => ({
  id: row.id,
  name: row.name,
  lengthMeters: Number(row.lengthMeters),
  depthMeters: Number(row.depthMeters),
  maxDraftMeters: Number(row.maxDraftMeters),
  status: row.status,
  currentUtilization: Number(row.currentUtilization),
  predictedUtilization: Number(row.predictedUtilization),
  queueCount: Number(row.queueCount),
  availableCranes: Number(row.availableCranes),
  maxCranes: Number(row.maxCranes),
  currentVesselId: row.currentVesselId || null,
  nextVesselId: row.nextVesselId || null,
  assignedCraneIds: Array.isArray(row.assignedCraneIds)
    ? row.assignedCraneIds
    : parseJsonSafe(row.assignedCraneIds, []),
  hourlyForecast: Array.isArray(row.hourlyForecast)
    ? row.hourlyForecast
    : parseJsonSafe(row.hourlyForecast, []),
  riskLevel: row.riskLevel || 'LOW',
});

const toCrane = (row: any): Crane => ({
  id: row.id,
  name: row.name,
  type: row.type,
  status: row.status,
  berthId: row.berthId,
  movesPerHour: Number(row.movesPerHour),
  utilizationPercent: Number(row.utilizationPercent),
  failureDurationHours: row.failureDurationHours != null ? Number(row.failureDurationHours) : undefined,
  impactSeverity: row.impactSeverity || undefined,
  assignedVesselId: row.assignedVesselId || null,
  lastMaintenance: row.lastMaintenance,
  nextMaintenance: row.nextMaintenance,
});

const toYardBlock = (row: any): YardBlock => ({
  id: row.id,
  name: row.name,
  category: row.category,
  totalTeu: Number(row.totalTeu),
  occupiedTeu: Number(row.occupiedTeu),
  utilizationPercent: Number(row.utilizationPercent),
  dwellTimeDays: Number(row.dwellTimeDays),
  inboundTeu24h: Number(row.inboundTeu24h),
  outboundTeu24h: Number(row.outboundTeu24h),
  congestionRisk: row.congestionRisk,
  suggestedRedistribution: parseJsonSafe(row.suggestedRedistribution, undefined),
});

const toAlert = (row: any): OperationalAlert => ({
  id: row.id,
  timestamp: row.timestamp,
  severity: row.severity,
  title: row.title,
  description: row.description,
  relatedEntity: parseJsonSafe(row.relatedEntity, { type: 'berth', id: '', name: '' }),
  isResolved: Boolean(row.isResolved),
  actionRoute: row.actionRoute,
  actionLabel: row.actionLabel,
});

const toShiftPlanItem = (row: any): ShiftPlanItem => ({
  id: row.id,
  dayOffset: Number(row.dayOffset),
  shift: row.shift,
  berthId: row.berthId,
  vesselId: row.vesselId || null,
  vesselName: row.vesselName || null,
  assignedCranes: Array.isArray(row.assignedCranes)
    ? row.assignedCranes
    : parseJsonSafe(row.assignedCranes, []),
  status: row.status,
  conflictReason: row.conflictReason || undefined,
});

const toRouteOption = (row: any): RouteOption => ({
  portCode: row.portCode,
  portName: row.portName,
  country: row.country,
  distanceNm: Number(row.distanceNm),
  eta: row.eta,
  delayHours: Number(row.delayHours),
  extraCostUsd: Number(row.extraCostUsd),
  riskLevel: row.riskLevel,
  isRecommended: Boolean(row.isRecommended),
  congestionScore: Number(row.congestionScore),
  rationale: row.rationale,
  coordinates: parseJsonSafe(row.coordinates, { x: 0, y: 0 }),
});

const toForecast = (row: any): CongestionForecastData => {
  const rawDrivers = Array.isArray(row.drivers) ? row.drivers : [];
  const rawPoints = Array.isArray(row.points) ? row.points : [];

  const drivers = rawDrivers.map((d: any) => ({
    factor: d.factor,
    percentage: Number(d.percentage),
    impact: d.impact,
    detail: d.detail,
  }));

  const points = rawPoints.map((p: any) => {
    const berthMap = parseJsonSafe(p.berthData, {});
    return {
      hour: p.hour,
      B01: Number(berthMap.B01 ?? 0),
      B02: Number(berthMap.B02 ?? 0),
      B03: Number(berthMap.B03 ?? 0),
      B04: Number(berthMap.B04 ?? 0),
      B05: Number(berthMap.B05 ?? 0),
      B06: Number(berthMap.B06 ?? 0),
      threshold: Number(p.threshold ?? 85),
    };
  });

  return {
    timeHorizon: row.timeHorizon,
    overallCongestionPercent: Number(row.overallCongestionPercent),
    riskBottleneckBerth: row.riskBottleneckBerth,
    bottleneckConfidence: Number(row.bottleneckConfidence),
    drivers,
    points,
  };
};

const toOptimization = (row: any): OptimizationResult => ({
  id: row.id,
  timestamp: row.timestamp,
  isApplied: Boolean(row.isApplied),
  targetVesselId: row.targetVesselId,
  currentPlan: parseJsonSafe(row.currentPlan, {}),
  optimizedPlan: parseJsonSafe(row.optimizedPlan, {}),
  waitTimeDeltaHours: Number(row.waitTimeDeltaHours),
  waitTimeReductionPercent: Number(row.waitTimeReductionPercent),
  queueReductionCount: Number(row.queueReductionCount),
  savingsEstimateUsd: Number(row.savingsEstimateUsd),
  rationale: row.rationale,
});

const toSimulation = (row: any): SimulationResult => ({
  id: row.id,
  scenario: parseJsonSafe(row.scenario, {}),
  before: parseJsonSafe(row.before, {}),
  after: parseJsonSafe(row.after, {}),
  recoveryPlan: parseJsonSafe(row.recoveryPlan, {}),
});

export class OperationsDataService {
  public static async fetchVessels(userId: string, role: string): Promise<Vessel[]> {
    let query = supabase.from('Vessel').select('*');
    if (role !== 'admin') {
      query = query.eq('ownerId', userId);
    }

    const { data, error } = await query.order('eta', { ascending: true });
    if (error) {
      console.warn('[OperationsDataService] fetchVessels warning:', error.message);
      return [];
    }
    return Array.isArray(data) ? data.map(toVessel) : [];
  }

  public static async upsertVessel(vessel: Vessel): Promise<void> {
    const { error } = await supabase.from('Vessel').upsert(toVesselRow(vessel));
    if (error) {
      console.warn('[OperationsDataService] upsertVessel warning:', error.message);
    }
  }

  public static async deleteVessel(id: string): Promise<void> {
    const { error } = await supabase.from('Vessel').delete().eq('id', id);
    if (error) {
      console.warn('[OperationsDataService] deleteVessel warning:', error.message);
    }
  }

  public static async fetchBerthRequests(userId: string, role: string): Promise<BerthRequest[]> {
    let query = supabase.from('BerthRequest').select('*');
    if (role !== 'admin') {
      query = query.eq('ownerId', userId);
    }

    const { data, error } = await query.order('submittedAt', { ascending: false });
    if (error) {
      console.warn('[OperationsDataService] fetchBerthRequests warning:', error.message);
      return [];
    }
    return Array.isArray(data) ? data.map(toBerthRequest) : [];
  }

  public static async upsertBerthRequest(request: BerthRequest): Promise<void> {
    const { error } = await supabase.from('BerthRequest').upsert(request);
    if (error) {
      console.warn('[OperationsDataService] upsertBerthRequest warning:', error.message);
    }
  }

  public static async fetchBerths(): Promise<Berth[]> {
    const { data, error } = await supabase.from('Berth').select('*').order('id');
    if (error) {
      console.warn('[OperationsDataService] fetchBerths warning:', error.message);
      return [];
    }
    return Array.isArray(data) ? data.map(toBerth) : [];
  }

  public static async upsertBerth(berth: Berth): Promise<void> {
    const row = {
      ...berth,
      assignedCraneIds: JSON.stringify(berth.assignedCraneIds || []),
      hourlyForecast: JSON.stringify(berth.hourlyForecast || []),
    };
    const { error } = await supabase.from('Berth').upsert(row);
    if (error) {
      console.warn('[OperationsDataService] upsertBerth warning:', error.message);
    }
  }

  public static async fetchCranes(): Promise<Crane[]> {
    const { data, error } = await supabase.from('Crane').select('*').order('id');
    if (error) {
      console.warn('[OperationsDataService] fetchCranes warning:', error.message);
      return [];
    }
    return Array.isArray(data) ? data.map(toCrane) : [];
  }

  public static async upsertCrane(crane: Crane): Promise<void> {
    const { error } = await supabase.from('Crane').upsert(crane);
    if (error) {
      console.warn('[OperationsDataService] upsertCrane warning:', error.message);
    }
  }

  public static async fetchYardBlocks(): Promise<YardBlock[]> {
    const { data, error } = await supabase.from('YardBlock').select('*').order('id');
    if (error) {
      console.warn('[OperationsDataService] fetchYardBlocks warning:', error.message);
      return [];
    }
    return Array.isArray(data) ? data.map(toYardBlock) : [];
  }

  public static async fetchAlerts(userId: string, role: string): Promise<OperationalAlert[]> {
    let query = supabase.from('OperationalAlert').select('*');
    if (role !== 'admin') {
      query = query.eq('ownerId', userId);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });
    if (error) {
      console.warn('[OperationsDataService] fetchAlerts warning:', error.message);
      return [];
    }
    return Array.isArray(data) ? data.map(toAlert) : [];
  }

  public static async upsertAlert(alert: OperationalAlert, ownerId?: string): Promise<void> {
    const row = {
      ...alert,
      relatedEntity: JSON.stringify(alert.relatedEntity),
      ...(ownerId ? { ownerId } : {}),
    };
    const { error } = await supabase.from('OperationalAlert').upsert(row);
    if (error) {
      console.warn('[OperationsDataService] upsertAlert warning:', error.message);
    }
  }

  public static async fetchShiftPlans(userId: string, role: string): Promise<ShiftPlanItem[]> {
    let query = supabase.from('ShiftPlanItem').select('*');
    if (role !== 'admin') {
      query = query.eq('ownerId', userId);
    }

    const { data, error } = await query.order('id', { ascending: true });
    if (error) {
      console.warn('[OperationsDataService] fetchShiftPlans warning:', error.message);
      return [];
    }
    return Array.isArray(data) ? data.map(toShiftPlanItem) : [];
  }

  public static async upsertShiftPlan(item: ShiftPlanItem, ownerId?: string): Promise<void> {
    const row = {
      ...item,
      assignedCranes: JSON.stringify(item.assignedCranes || []),
      ...(ownerId ? { ownerId } : {}),
    };
    const { error } = await supabase.from('ShiftPlanItem').upsert(row);
    if (error) {
      console.warn('[OperationsDataService] upsertShiftPlan warning:', error.message);
    }
  }

  public static async fetchRoutes(userId: string, role: string): Promise<RouteOption[]> {
    let query = supabase.from('RouteOption').select('*');
    if (role !== 'admin') {
      query = query.eq('ownerId', userId);
    }

    const { data, error } = await query.order('portCode', { ascending: true });
    if (error) {
      console.warn('[OperationsDataService] fetchRoutes warning:', error.message);
      return [];
    }
    return Array.isArray(data) ? data.map(toRouteOption) : [];
  }

  public static async fetchForecast(userId: string, role: string): Promise<CongestionForecastData | null> {
    let query = supabase.from('CongestionForecast').select('*, drivers:ForecastDriver(*), points:ForecastPoint(*)');
    if (role !== 'admin') {
      query = query.eq('ownerId', userId);
    }

    const { data, error } = await query.order('createdAt', { ascending: false }).limit(1);
    if (error || !data?.length) {
      if (error) console.warn('[OperationsDataService] fetchForecast warning:', error.message);
      return null;
    }
    return toForecast(data[0]);
  }

  public static async fetchOptimization(userId: string, role: string): Promise<OptimizationResult | null> {
    let query = supabase.from('OptimizationResult').select('*');
    if (role !== 'admin') {
      query = query.eq('ownerId', userId);
    }

    const { data, error } = await query.order('timestamp', { ascending: false }).limit(1);
    if (error || !data?.length) {
      if (error) console.warn('[OperationsDataService] fetchOptimization warning:', error.message);
      return null;
    }
    return toOptimization(data[0]);
  }

  public static async upsertOptimization(optimization: OptimizationResult, ownerId?: string): Promise<void> {
    const row = {
      ...optimization,
      currentPlan: JSON.stringify(optimization.currentPlan),
      optimizedPlan: JSON.stringify(optimization.optimizedPlan),
      ...(ownerId ? { ownerId } : {}),
    };
    const { error } = await supabase.from('OptimizationResult').upsert(row);
    if (error) {
      console.warn('[OperationsDataService] upsertOptimization warning:', error.message);
    }
  }

  public static async fetchSimulation(userId: string, role: string): Promise<SimulationResult | null> {
    let query = supabase.from('SimulationResult').select('*');
    if (role !== 'admin') {
      query = query.eq('ownerId', userId);
    }

    const { data, error } = await query.order('id', { ascending: false }).limit(1);
    if (error || !data?.length) {
      if (error) console.warn('[OperationsDataService] fetchSimulation warning:', error.message);
      return null;
    }
    return toSimulation(data[0]);
  }

  public static async upsertSimulation(simulation: SimulationResult, ownerId?: string): Promise<void> {
    const row = {
      ...simulation,
      scenario: JSON.stringify(simulation.scenario),
      before: JSON.stringify(simulation.before),
      after: JSON.stringify(simulation.after),
      recoveryPlan: JSON.stringify(simulation.recoveryPlan),
      ...(ownerId ? { ownerId } : {}),
    };
    const { error } = await supabase.from('SimulationResult').upsert(row);
    if (error) {
      console.warn('[OperationsDataService] upsertSimulation warning:', error.message);
    }
  }
}
