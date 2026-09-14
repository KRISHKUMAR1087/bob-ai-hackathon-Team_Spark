import React, { createContext, useContext, useState, useMemo } from 'react';
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
  CopilotMessage,
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
} from '../services/mockData';
import { geminiCopilotService } from '../services/geminiCopilotService';

export interface ToastState {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface OperationsContextType {
  vessels: Vessel[];
  berths: Berth[];
  cranes: Crane[];
  yardBlocks: YardBlock[];
  forecast: CongestionForecastData;
  optimization: OptimizationResult;
  simulation: SimulationResult;
  routes: RouteOption[];
  shiftPlans: ShiftPlanItem[];
  alerts: OperationalAlert[];
  
  // State flags
  isOptimizationApplied: boolean;
  isRecoveryPlanApplied: boolean;
  isSimulating: boolean;

  // UI state
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  copilotMessages: CopilotMessage[];
  isCopilotLoading: boolean;
  toast: ToastState | null;
  clearToast: () => void;
  showToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;

  // Operational Actions
  applyOptimization: () => void;
  runSimulation: (scenarioType?: string, duration?: number) => Promise<void>;
  applyRecoveryPlan: () => void;
  reassignVesselBerth: (vesselId: string, targetBerthId: string) => void;
  resolveAlert: (alertId: string) => void;
  sendCopilotMessage: (query: string) => Promise<void>;
  resetToDefault: () => void;

  // Selected Entities
  selectedBerthId: string;
  setSelectedBerthId: (id: string) => void;
  selectedVesselId: string;
  setSelectedVesselId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vessels, setVessels] = useState<Vessel[]>(initialVessels);
  const [berths, setBerths] = useState<Berth[]>(initialBerths);
  const [cranes, setCranes] = useState<Crane[]>(initialCranes);
  const [yardBlocks, setYardBlocks] = useState<YardBlock[]>(initialYardBlocks);
  const [forecast, setForecast] = useState<CongestionForecastData>(initialForecastData);
  const [optimization, setOptimization] = useState<OptimizationResult>(initialOptimizationResult);
  const [simulation, setSimulation] = useState<SimulationResult>(initialSimulationResult);
  const [routes] = useState<RouteOption[]>(initialRouteOptions);
  const [shiftPlans, setShiftPlans] = useState<ShiftPlanItem[]>(initialShiftPlans);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(initialAlerts);

  const [isOptimizationApplied, setIsOptimizationApplied] = useState<boolean>(false);
  const [isRecoveryPlanApplied, setIsRecoveryPlanApplied] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [selectedBerthId, setSelectedBerthId] = useState<string>('B04');
  const [selectedVesselId, setSelectedVesselId] = useState<string>('VES-01');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'gemini',
      text: `Good day, Supervisor. I am your **PortPulse Copilot**. 

I am monitoring real-time AIS feeds, tidal windows, crane telemetry, and predictive bottlenecks across all 6 berths. 

**Current Alert Highlight:** Berth **B04** is projected to reach **94% saturation within 24 hours** due to incoming ULCV bunching and STS C03 downtime. How would you like to proceed?`,
      timestamp: 'Just now',
      suggestedActions: [
        { label: 'Why is B04 at risk?', prompt: 'Why is B04 at risk?' },
        { label: 'What happens if C03 fails?', prompt: 'What happens if C03 fails for 8 hours?' },
        { label: 'Optimize Operations', actionRoute: '/decision/optimizer' },
      ],
    },
  ]);

  const showToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = 'toast-' + Date.now();
    setToast({ id, type, title, message });
    setTimeout(() => {
      setToast(current => (current?.id === id ? null : current));
    }, 4500);
  };

  const clearToast = () => setToast(null);

  // Apply Optimization Recommendation
  const applyOptimization = () => {
    setIsOptimizationApplied(true);
    setOptimization(prev => ({
      ...prev,
      isApplied: true,
    }));

    // Update Ocean Star assignment to B02
    setVessels(prev =>
      prev.map(v => {
        if (v.id === 'VES-01') {
          return {
            ...v,
            assignedBerth: 'B02',
            predictedWaitHours: 6.8,
            demurrageRisk: 'Low',
            recommendedAction: 'Optimized: Assigned to B02 with 4 STS cranes (Wait reduced to 6.8h).',
          };
        }
        return v;
      })
    );

    // Update Berths utilization
    setBerths(prev =>
      prev.map(b => {
        if (b.id === 'B04') {
          return {
            ...b,
            status: 'Occupied',
            currentUtilization: 76,
            predictedUtilization: 78,
            queueCount: 4,
            riskLevel: 'LOW',
            nextVesselId: null,
          };
        }
        if (b.id === 'B02') {
          return {
            ...b,
            predictedUtilization: 74,
            queueCount: 3,
            nextVesselId: 'VES-01',
          };
        }
        return b;
      })
    );

    // Update Forecast points
    setForecast(prev => ({
      ...prev,
      overallCongestionPercent: 68,
      points: prev.points.map(p => ({
        ...p,
        B04: Math.max(68, p.B04 - 16),
        B02: Math.min(80, p.B02 + 6),
      })),
    }));

    // Update Shift Plans (resolve conflict)
    setShiftPlans(prev =>
      prev.map(sp => {
        if (sp.vesselId === 'VES-01') {
          return {
            ...sp,
            berthId: 'B02',
            status: 'Optimized',
            assignedCranes: ['C04', 'C06'],
            conflictReason: undefined,
          };
        }
        return sp;
      })
    );

    showToast('success', 'Optimization Applied Successfully', 'Ocean Star reassigned to Berth B02. Expected wait decreased from 11.4h to 6.8h.');
  };

  // Run What-If Simulation
  const runSimulation = async (scenarioType = 'crane_failure', duration = 8) => {
    setIsSimulating(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    setSimulation(prev => ({
      ...prev,
      scenario: {
        ...prev.scenario,
        durationHours: duration,
        type: scenarioType as any,
      },
      after: {
        queueCount: 11,
        avgWaitHours: 17.8,
        berthUtilizationPercent: 94,
      },
    }));

    setIsSimulating(false);
    showToast('warning', 'Simulation Complete', `Projected disruption: Queue increases from 7 to 11 vessels, wait escalates to 17.8h.`);
  };

  // Apply AI Recovery Plan
  const applyRecoveryPlan = () => {
    setIsRecoveryPlanApplied(true);
    setSimulation(prev => ({
      ...prev,
      recoveryPlan: {
        ...prev.recoveryPlan,
        isApplied: true,
      },
    }));

    // Step 1: Move C05 to B04
    setCranes(prev =>
      prev.map(c => {
        if (c.id === 'C05') {
          return {
            ...c,
            berthId: 'B04',
            status: 'ACTIVE',
            movesPerHour: 30,
            utilizationPercent: 85,
          };
        }
        return c;
      })
    );

    // Step 2: Reassign Ocean Star to B02
    setVessels(prev =>
      prev.map(v => {
        if (v.id === 'VES-01') {
          return {
            ...v,
            assignedBerth: 'B02',
            predictedWaitHours: 6.8,
            demurrageRisk: 'Low',
          };
        }
        if (v.id === 'VES-05') {
          return {
            ...v,
            eta: 'Tomorrow, 20:45 UTC (+4h buffer)',
            predictedWaitHours: 4.2,
          };
        }
        return v;
      })
    );

    // Step 3: Update Berths
    setBerths(prev =>
      prev.map(b => {
        if (b.id === 'B04') {
          return {
            ...b,
            availableCranes: 2,
            assignedCraneIds: ['C05'],
            currentUtilization: 74,
            predictedUtilization: 76,
            queueCount: 4,
            riskLevel: 'LOW',
          };
        }
        if (b.id === 'B02') {
          return {
            ...b,
            nextVesselId: 'VES-01',
            queueCount: 3,
          };
        }
        return b;
      })
    );

    // Resolve all shift conflicts in 72-Hour Planner
    setShiftPlans(prev =>
      prev.map(sp => ({
        ...sp,
        status: sp.status === 'Conflict' ? 'Optimized' : sp.status,
        conflictReason: undefined,
      }))
    );

    // Resolve critical C03 alert
    setAlerts(prev =>
      prev.map(a => (a.id === 'ALT-01' ? { ...a, isResolved: true } : a))
    );

    showToast('success', 'Recovery Plan Deployed', 'C05 redeployed to B04, Ocean Star diverted to B02, and all 3 schedule conflicts resolved.');
  };

  // Reassign Berth manually
  const reassignVesselBerth = (vesselId: string, targetBerthId: string) => {
    setVessels(prev =>
      prev.map(v => (v.id === vesselId ? { ...v, assignedBerth: targetBerthId } : v))
    );
    showToast('info', 'Berth Assignment Updated', `Vessel reassigned to ${targetBerthId}.`);
  };

  // Resolve Alert
  const resolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, isResolved: true } : a))
    );
    showToast('info', 'Alert Acknowledged', 'Operational alert has been marked as resolved.');
  };

  // Send message to Gemini Copilot
  const sendCopilotMessage = async (query: string) => {
    if (!query.trim()) return;

    const userMsg: CopilotMessage = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
    };

    setCopilotMessages(prev => [...prev, userMsg]);
    setIsCopilotLoading(true);

    const oceanStar = vessels.find(v => v.id === 'VES-01');
    const b04 = berths.find(b => b.id === 'B04');
    const c03 = cranes.find(c => c.id === 'C03');
    const activeAlerts = alerts.filter(a => !a.isResolved);

    const response = await geminiCopilotService.processUserQuery(query, {
      isOptimizationApplied,
      isRecoveryPlanApplied,
      oceanStarBerth: oceanStar?.assignedBerth || 'B04',
      b04Utilization: b04?.predictedUtilization || 94,
      c03Status: c03?.status || 'FAILED',
      activeAlertsCount: activeAlerts.length,
    });

    setCopilotMessages(prev => [...prev, response]);
    setIsCopilotLoading(false);
  };

  // Reset to Baseline Demo State
  const resetToDefault = () => {
    setVessels(initialVessels);
    setBerths(initialBerths);
    setCranes(initialCranes);
    setYardBlocks(initialYardBlocks);
    setForecast(initialForecastData);
    setOptimization(initialOptimizationResult);
    setSimulation(initialSimulationResult);
    setShiftPlans(initialShiftPlans);
    setAlerts(initialAlerts);
    setIsOptimizationApplied(false);
    setIsRecoveryPlanApplied(false);
    showToast('info', 'State Reset', 'Port operations reset to baseline demo state.');
  };

  const contextValue = useMemo(
    () => ({
      vessels,
      berths,
      cranes,
      yardBlocks,
      forecast,
      optimization,
      simulation,
      routes,
      shiftPlans,
      alerts,
      isOptimizationApplied,
      isRecoveryPlanApplied,
      isSimulating,
      isCopilotOpen,
      setIsCopilotOpen,
      copilotMessages,
      isCopilotLoading,
      toast,
      clearToast,
      showToast,
      applyOptimization,
      runSimulation,
      applyRecoveryPlan,
      reassignVesselBerth,
      resolveAlert,
      sendCopilotMessage,
      resetToDefault,
      selectedBerthId,
      setSelectedBerthId,
      selectedVesselId,
      setSelectedVesselId,
      searchQuery,
      setSearchQuery,
    }),
    [
      vessels,
      berths,
      cranes,
      yardBlocks,
      forecast,
      optimization,
      simulation,
      routes,
      shiftPlans,
      alerts,
      isOptimizationApplied,
      isRecoveryPlanApplied,
      isSimulating,
      isCopilotOpen,
      copilotMessages,
      isCopilotLoading,
      toast,
      selectedBerthId,
      selectedVesselId,
      searchQuery,
    ]
  );

  return (
    <OperationsContext.Provider value={contextValue}>
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};
