import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  AlertTriangle,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import { BeforeAfterCard } from '../components/operations/BeforeAfterCard';

export const SimulatorPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    simulation,
    runSimulation,
    applyRecoveryPlan,
    isRecoveryPlanApplied,
    isSimulating,
    setIsCopilotOpen,
    sendCopilotMessage,
  } = useOperations();

  const [selectedScenarioType, setSelectedScenarioType] = useState<string>('crane_failure');
  const [selectedEntity, setSelectedEntity] = useState<string>('C03');
  const [durationHours, setDurationHours] = useState<number>(8);

  const handleSimulate = async () => {
    await runSimulation(selectedScenarioType, durationHours);
  };

  const handleAskCopilot = async () => {
    setIsCopilotOpen(true);
    await sendCopilotMessage('What happens if Crane C03 fails for 8 hours?');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              What-If Disruption Simulator
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              Scenario Stress-Testing
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Simulate equipment outages and surges, evaluate the operational impact, and execute autonomous recovery plans.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAskCopilot}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors shadow-subtle"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span>Consult Gemini</span>
          </button>
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 disabled:opacity-50 transition-all shadow-subtle"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Calculating Impact...' : 'Simulate Scenario'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Scenario Controls & Three-Stage Simulation Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage 1: Scenario Builder Controls */}
        <div className="bg-surface p-6 rounded-card border border-border-subtle shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h2 className="text-sm font-semibold text-text-main flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-text-muted" />
              <span>1. Scenario Builder</span>
            </h2>
            <span className="text-xs text-text-caption">Input</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-text-muted block mb-1.5">Disruption Event:</label>
              <select
                value={selectedScenarioType}
                onChange={e => setSelectedScenarioType(e.target.value)}
                className="w-full bg-surface-subtle border border-border-subtle rounded-md px-3 py-2 text-xs text-text-main focus:outline-hidden focus:border-brand-teal"
              >
                <option value="crane_failure">Crane Equipment Outage (STS)</option>
                <option value="berth_closure">Unscheduled Berth Closure</option>
                <option value="vessel_surge">Tidal Arrival Surge (3+ ULCVs)</option>
                <option value="vessel_delay">Coastal Squall Arrival Delay</option>
                <option value="yard_capacity_reduction">Intermodal Gate Stoppage</option>
              </select>
            </div>

            <div>
              <label className="text-text-muted block mb-1.5">Target Resource:</label>
              <select
                value={selectedEntity}
                onChange={e => setSelectedEntity(e.target.value)}
                className="w-full bg-surface-subtle border border-border-subtle rounded-md px-3 py-2 text-xs text-text-main focus:outline-hidden focus:border-brand-teal"
              >
                <option value="C03">Megamax STS 03 (Berth B04)</option>
                <option value="B04">Berth B04 Quay Structure</option>
                <option value="C07">STS 07 (Berth B03)</option>
                <option value="CY03">Yard Block CY-03 Reefer</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-text-muted mb-1">
                <span>Outage Duration:</span>
                <span className="font-semibold text-text-main">{durationHours} hours</span>
              </div>
              <input
                type="range"
                min="2"
                max="24"
                step="2"
                value={durationHours}
                onChange={e => setDurationHours(Number(e.target.value))}
                className="w-full accent-brand-teal cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-text-caption mt-1">
                <span>2h</span>
                <span>8h (Default)</span>
                <span>24h</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200 text-xs space-y-1">
              <span className="text-amber-900 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Active Test: Crane C03 Outage (8h)
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Simulates complete loss of main hoist drive on C03 during peak ULCV Ocean Star berthing.
              </p>
            </div>

            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full py-2.5 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-subtle flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>Simulate Disruption</span>
            </button>
          </div>
        </div>

        {/* Stage 2 & Stage 3: Impact & Recovery Plan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stage 2: Simulated Impact */}
          <BeforeAfterCard
            title="2. Simulated Disruption Impact (Projected vs Baseline)"
            beforeTitle="Current Baseline"
            afterTitle="Projected After Outage"
            metrics={[
              {
                label: 'Anchorage Queue',
                before: `${simulation.before.queueCount} vessels`,
                after: `${simulation.after.queueCount} vessels`,
                delta: '+4 vessels backlog (+57%)',
                isPositive: false,
              },
              {
                label: 'Average Wait Time',
                before: `${simulation.before.avgWaitHours}h`,
                after: `${simulation.after.avgWaitHours}h`,
                delta: '+6.4 hours delay spike',
                isPositive: false,
              },
              {
                label: 'B04 Saturation',
                before: `${simulation.before.berthUtilizationPercent}%`,
                after: `${simulation.after.berthUtilizationPercent}%`,
                delta: '+12% (Critical Bottleneck)',
                isPositive: false,
              },
              {
                label: 'Demurrage Exposure',
                before: '$35,000',
                after: '$210,000',
                delta: '+$175k Penalty Risk',
                isPositive: false,
              },
            ]}
          />

          {/* Stage 3: AI Recovery Plan */}
          <div className="bg-surface p-6 rounded-card border border-emerald-200 shadow-subtle space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    3. AI Recovery Plan
                  </h3>
                  <span className="text-xs text-emerald-800 font-medium px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                    Est. Recovery: 5.2h
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Automated re-allocation protocol mitigating 100% of the simulated queue surge.
                </p>
              </div>

              {!isRecoveryPlanApplied ? (
                <button
                  onClick={applyRecoveryPlan}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-subtle"
                >
                  <Zap className="w-4 h-4" />
                  <span>Apply Recovery Plan</span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-800 px-3 py-1.5 rounded-md bg-emerald-100 border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Recovery Plan Active</span>
                </span>
              )}
            </div>

            {/* 3 Step Actions */}
            <div className="space-y-3 text-xs">
              {simulation.recoveryPlan.steps.map(step => (
                <div
                  key={step.order}
                  className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle flex items-start gap-3.5"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    {step.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-main text-xs">{step.title}</span>
                      <span className="text-[11px] text-text-muted bg-white px-2 py-0.5 rounded border border-border-subtle">
                        {step.targetEntity}
                      </span>
                    </div>
                    <p className="text-text-muted mt-1 text-xs leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Post-Recovery Action Links */}
            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="text-text-muted">
                {isRecoveryPlanApplied
                  ? 'Recovery actions dispatched to 72-Hour Planner and Operations Board.'
                  : 'Click Apply Recovery Plan to deploy crane and berth changes.'}
              </span>
              <button
                onClick={() => navigate('/decision/planner')}
                className="text-brand-teal hover:underline font-medium flex items-center gap-1"
              >
                <span>View 72-Hour Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
