import {
  Vessel,
  Berth,
  Crane,
  YardBlock,
  CongestionForecastData,
  OptimizationResult,
  SimulationResult,
  RouteOption,
  ShiftPlanItem,
  OperationalAlert,
} from '../types/operations';
import {
  initialVessels,
  initialBerths,
  initialCranes,
  initialYardBlocks,
  initialForecastData,
  initialOptimizationResult,
  initialSimulationResult,
  initialRouteOptions,
  initialShiftPlans,
  initialAlerts,
} from './mockData';

export class PortOperationsService {
  private vessels: Vessel[] = [...initialVessels];
  private berths: Berth[] = [...initialBerths];
  private cranes: Crane[] = [...initialCranes];
  private yardBlocks: YardBlock[] = [...initialYardBlocks];
  private forecast: CongestionForecastData = { ...initialForecastData };
  private optimization: OptimizationResult = { ...initialOptimizationResult };
  private simulation: SimulationResult = { ...initialSimulationResult };
  private routes: RouteOption[] = [...initialRouteOptions];
  private shiftPlans: ShiftPlanItem[] = [...initialShiftPlans];
  private alerts: OperationalAlert[] = [...initialAlerts];

  // System status summary
  getPortStatus() {
    const vesselsInPort = this.vessels.filter(v => ['Berthing', 'Loading'].includes(v.status)).length;
    const arrivingCount = this.vessels.filter(v => v.status === 'Arriving').length;
    const avgBerthUtil = Math.round(
      this.berths.reduce((acc, b) => acc + b.currentUtilization, 0) / this.berths.length
    );
    const activeCranes = this.cranes.filter(c => c.status === 'ACTIVE').length;
    const craneAvail = Math.round((activeCranes / this.cranes.length) * 100);
    const totalYardOccupied = this.yardBlocks.reduce((acc, y) => acc + y.occupiedTeu, 0);
    const totalYardCapacity = this.yardBlocks.reduce((acc, y) => acc + y.totalTeu, 0);
    const yardUtil = Math.round((totalYardOccupied / totalYardCapacity) * 100);
    const queueTotal = this.berths.reduce((acc, b) => acc + b.queueCount, 0);

    return {
      vesselsInPort,
      vesselsArriving: arrivingCount,
      activeBerthUtilization: avgBerthUtil,
      craneAvailability: craneAvail,
      yardUtilization: yardUtil,
      currentQueue: queueTotal,
      predictedCongestion: avgBerthUtil > 70 ? 'HIGH' : 'NORMAL',
      highRiskBerth: 'B04',
      highRiskBerthUtilization: 82,
      highRiskBerthPredicted: 94,
    };
  }

  getVessels(): Vessel[] {
    return [...this.vessels];
  }

  getVesselById(id: string): Vessel | undefined {
    return this.vessels.find(v => v.id === id || v.imo === id);
  }

  getBerths(): Berth[] {
    return [...this.berths];
  }

  getBerthById(id: string): Berth | undefined {
    return this.berths.find(b => b.id === id);
  }

  getCranes(): Crane[] {
    return [...this.cranes];
  }

  getCraneById(id: string): Crane | undefined {
    return this.cranes.find(c => c.id === id);
  }

  getYardBlocks(): YardBlock[] {
    return [...this.yardBlocks];
  }

  getCongestionForecast(): CongestionForecastData {
    return { ...this.forecast };
  }

  getOptimization(): OptimizationResult {
    return { ...this.optimization };
  }

  getSimulation(): SimulationResult {
    return { ...this.simulation };
  }

  getRoutes(): RouteOption[] {
    return [...this.routes];
  }

  getShiftPlans(): ShiftPlanItem[] {
    return [...this.shiftPlans];
  }

  getAlerts(): OperationalAlert[] {
    return [...this.alerts];
  }
}

export const portOperationsService = new PortOperationsService();
