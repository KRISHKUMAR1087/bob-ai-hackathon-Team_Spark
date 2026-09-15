import { supabase } from '../lib/supabase';
import {
  BerthRequest,
  BerthRequestStatus,
  PriorityLevel,
  Vessel,
  VesselStatus,
} from '../types/operations';

type VesselRow = Omit<Vessel, 'timelineEvents'>;

const defaultTimeline = (vessel: Pick<Vessel, 'eta'>) => [
  { stage: 'Port Notice Filed', time: 'Submitted', status: 'completed' as const },
  { stage: 'Pilot Station Entry', time: vessel.eta, status: 'scheduled' as const },
  { stage: 'Berthing', time: '+1h after pilot', status: 'scheduled' as const },
];

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
}
