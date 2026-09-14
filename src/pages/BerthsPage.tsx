import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import { UtilizationBar } from '../components/common/UtilizationBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskBadge } from '../components/common/RiskBadge';
import { Drawer } from '../components/common/Drawer';
import { Berth } from '../types/operations';

export const BerthsPage: React.FC = () => {
  const navigate = useNavigate();
  const { berths, vessels, cranes, isOptimizationApplied, isRecoveryPlanApplied } = useOperations();
  const [inspectedBerth, setInspectedBerth] = useState<Berth | null>(null);

  const getVesselName = (vesselId: string | null) => {
    if (!vesselId) return 'None';
    const v = vessels.find(x => x.id === vesselId);
    return v ? v.name : vesselId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Berths Utilization & Allocation
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Monitoring 6 commercial quays, depth restrictions, and predicted turnaround queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-text-muted bg-surface px-3 py-1.5 rounded-md border border-border-subtle shadow-subtle">
            Total Quay Length: <strong className="text-text-main">2,250m</strong>
          </div>
          <button
            onClick={() => navigate('/decision/optimizer')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-subtle"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Optimize All Berths</span>
          </button>
        </div>
      </div>

      {/* Berth Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {berths.map(berth => {
          const isHighRisk = berth.id === 'B04' && !isOptimizationApplied && !isRecoveryPlanApplied;

          return (
            <div
              key={berth.id}
              onClick={() => setInspectedBerth(berth)}
              className={`bg-surface rounded-card p-5 border transition-all duration-150 cursor-pointer hover:shadow-elevated flex flex-col justify-between space-y-4 ${
                isHighRisk
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : 'border-border-subtle hover:border-slate-300'
              } shadow-subtle`}
            >
              <div>
                {/* Berth Header */}
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border-subtle flex items-center justify-center font-semibold text-xs text-text-main">
                      {berth.id}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-main truncate">
                        {berth.name.split('(')[0]}
                      </h3>
                      <span className="text-[11px] text-text-caption">
                        {berth.lengthMeters}m • Max Draft: {berth.maxDraftMeters}m
                      </span>
                    </div>
                  </div>

                  <RiskBadge level={isHighRisk ? 'HIGH' : berth.riskLevel} size="sm" />
                </div>

                {/* Utilization Metrics & Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-text-muted">Current Utilization:</span>
                    <span className="font-bold text-text-main text-sm">
                      {berth.currentUtilization}%
                    </span>
                  </div>
                  <UtilizationBar
                    percentage={berth.currentUtilization}
                    threshold={85}
                    height="h-2"
                  />

                  <div className="flex items-baseline justify-between text-xs pt-1">
                    <span className="text-text-muted">Predicted 24h:</span>
                    <span
                      className={`font-semibold ${
                        isHighRisk ? 'text-rose-600' : 'text-text-main'
                      }`}
                    >
                      {berth.predictedUtilization}%{' '}
                      {isHighRisk ? '(Bottleneck)' : berth.id === 'B02' ? '(Available)' : ''}
                    </span>
                  </div>
                </div>

                {/* Assignments & Capacity Grid */}
                <div className="mt-4 p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Current Vessel:</span>
                    <span className="text-text-main font-medium truncate max-w-[150px]">
                      {getVesselName(berth.currentVesselId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Next Vessel:</span>
                    <span
                      className={`font-medium truncate max-w-[150px] ${
                        berth.id === 'B04' && !isOptimizationApplied
                          ? 'text-rose-600 font-semibold'
                          : 'text-text-main'
                      }`}
                    >
                      {getVesselName(berth.nextVesselId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Assigned Cranes:</span>
                    <span className="text-text-main">
                      {berth.assignedCraneIds.length} Cranes ({berth.assignedCraneIds.join(', ')})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Anchorage Queue:</span>
                    <span
                      className={`font-medium ${
                        berth.queueCount > 3 ? 'text-rose-600 font-semibold' : 'text-text-main'
                      }`}
                    >
                      {berth.queueCount} vessels waiting
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                <span className="text-xs text-brand-teal hover:underline font-medium flex items-center gap-1">
                  <span>Inspect Details</span>
                  <ArrowRight className="w-3 h-3" />
                </span>

                {berth.id === 'B04' && !isOptimizationApplied && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigate('/decision/optimizer');
                    }}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 shadow-subtle"
                  >
                    Optimize B04
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Berth Detail Drawer */}
      <Drawer
        isOpen={!!inspectedBerth}
        onClose={() => setInspectedBerth(null)}
        title={inspectedBerth?.name || 'Berth Details'}
        subtitle={`Quayside Specification & Capacity Telemetry (${inspectedBerth?.id})`}
      >
        {inspectedBerth && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-surface-subtle p-4 rounded-lg border border-border-subtle">
              <div>
                <div className="text-xs text-text-muted">Operational Status</div>
                <div className="text-base font-semibold text-text-main mt-0.5">
                  {inspectedBerth.status}
                </div>
              </div>
              <RiskBadge level={inspectedBerth.riskLevel} />
            </div>

            {/* Utilization Curve */}
            <div className="bg-surface p-4 rounded-lg border border-border-subtle space-y-3">
              <h4 className="text-xs font-semibold text-text-main uppercase tracking-wider">
                Predicted Hourly Trajectory
              </h4>
              <div className="space-y-2">
                {inspectedBerth.hourlyForecast.map((hf, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="w-12 text-text-muted">{hf.hour}</span>
                    <div className="flex-1">
                      <UtilizationBar percentage={hf.utilization} threshold={85} height="h-2" />
                    </div>
                    <span className="w-10 text-right font-medium text-text-main">
                      {hf.utilization}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Crane Allocation */}
            <div className="bg-surface p-4 rounded-lg border border-border-subtle space-y-3">
              <h4 className="text-xs font-semibold text-text-main uppercase tracking-wider">
                Assigned STS Crane Gangs
              </h4>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {inspectedBerth.assignedCraneIds.map(cId => {
                  const crane = cranes.find(c => c.id === cId);
                  return (
                    <div
                      key={cId}
                      className="p-3 rounded-lg bg-surface-subtle border border-border-subtle space-y-1"
                    >
                      <div className="font-semibold text-text-main">{cId}</div>
                      <div className="text-[11px] text-text-muted">
                        Status: <StatusBadge status={crane?.status || 'ACTIVE'} />
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Throughput: {crane?.movesPerHour || 0} moves/hr
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setInspectedBerth(null);
                  navigate('/decision/optimizer');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-subtle"
              >
                <Zap className="w-4 h-4" />
                <span>Open in Operations Optimizer</span>
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
