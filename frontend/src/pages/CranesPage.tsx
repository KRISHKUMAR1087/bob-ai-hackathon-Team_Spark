import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { UtilizationBar } from '../components/common/UtilizationBar';
import { Drawer } from '../components/common/Drawer';
import { Crane } from '../types/operations';

export const CranesPage: React.FC = () => {
  const navigate = useNavigate();
  const { cranes, isRecoveryPlanApplied } = useOperations();
  const [selectedCrane, setSelectedCrane] = useState<Crane | null>(null);

  const activeCranes = cranes.filter(c => c.status === 'ACTIVE').length;
  const failedCranes = cranes.filter(c => c.status === 'FAILED').length;
  const maintenanceCranes = cranes.filter(c => c.status === 'MAINTENANCE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            STS & Yard Crane Fleet Operations
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Real-time telemetry, hoist cycle speeds, and disruption simulation for 8 ship-to-shore gantry cranes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              {activeCranes} Active
            </span>
            <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-medium">
              {failedCranes} Failed
            </span>
            <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              {maintenanceCranes} Service
            </span>
          </div>

          <button
            onClick={() => navigate('/decision/simulator')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors shadow-subtle"
          >
            <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
            <span>Simulate Disruption</span>
          </button>
        </div>
      </div>

      {/* Featured Failure Incident Banner (Crane C03) */}
      <div className="bg-rose-50/50 p-5 rounded-card border border-rose-200 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-rose-950">
                Equipment Fault: Crane C03 Unavailable
              </h3>
              <span className="text-[10px] px-2 py-0.2 rounded bg-rose-200 text-rose-800 font-semibold">
                High Operational Impact
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-2xl">
              Megamax STS 03 at Berth B04 experienced a main hoist drive fault. Estimated outage duration: <strong>8 hours</strong>. Quayside crane capacity cut by 50%.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/decision/simulator')}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-subtle"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Simulate Impact & Recovery</span>
        </button>
      </div>

      {/* Cranes Fleet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cranes.map(crane => {
          const isFailed = crane.status === 'FAILED';
          const isRedeployed = crane.id === 'C05' && isRecoveryPlanApplied;

          return (
            <div
              key={crane.id}
              onClick={() => setSelectedCrane(crane)}
              className={`bg-surface p-5 rounded-card border cursor-pointer transition-all hover:shadow-elevated flex flex-col justify-between space-y-3 shadow-subtle ${
                isFailed
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isRedeployed
                  ? 'border-emerald-300'
                  : 'border-border-subtle hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-surface-subtle border border-border-subtle flex items-center justify-center font-semibold text-xs text-text-main">
                      {crane.id}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-main">{crane.name}</div>
                      <div className="text-[11px] text-text-caption">{crane.type} Crane</div>
                    </div>
                  </div>
                  <StatusBadge status={crane.status} />
                </div>

                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Berth Location:</span>
                    <span className="font-semibold text-text-main">
                      {crane.berthId} {isRedeployed ? '(Redeployed)' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Moves / Hour:</span>
                    <span className="font-semibold text-text-main">{crane.movesPerHour} moves/hr</span>
                  </div>

                  {/* Workload Utilization Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-text-caption">
                      <span>Workload:</span>
                      <span>{crane.utilizationPercent}%</span>
                    </div>
                    <UtilizationBar
                      percentage={crane.utilizationPercent}
                      threshold={85}
                      height="h-1.5"
                    />
                  </div>

                  <div className="flex justify-between text-text-caption text-[11px] pt-1">
                    <span>Maintenance:</span>
                    <span className="truncate">{crane.nextMaintenance}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-border-subtle flex items-center justify-between text-xs text-brand-teal hover:underline font-medium">
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Crane Detail Drawer */}
      <Drawer
        isOpen={!!selectedCrane}
        onClose={() => setSelectedCrane(null)}
        title={selectedCrane?.name || 'Crane Telemetry'}
        subtitle={`Equipment Specification & Diagnostics (${selectedCrane?.id})`}
      >
        {selectedCrane && (
          <div className="space-y-5 text-xs">
            <div className="bg-surface-subtle p-4 rounded-lg border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-text-muted text-xs">Operating Status</span>
                <div className="font-semibold text-text-main text-sm mt-0.5">
                  {selectedCrane.status}
                </div>
              </div>
              <StatusBadge status={selectedCrane.status} />
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-subtle space-y-2.5">
              <div className="flex justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Assigned Berth:</span>
                <span className="font-semibold text-text-main">{selectedCrane.berthId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Hourly Cycle Throughput:</span>
                <span className="font-semibold text-text-main">
                  {selectedCrane.movesPerHour} TEU / hour
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Peak Workload:</span>
                <span className="font-semibold text-text-main">
                  {selectedCrane.utilizationPercent}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle">
                <span className="text-text-muted">Last Preventive Service:</span>
                <span className="text-text-main">{selectedCrane.lastMaintenance}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Next Service Window:</span>
                <span className="text-text-main">{selectedCrane.nextMaintenance}</span>
              </div>
            </div>

            {selectedCrane.status === 'FAILED' && (
              <button
                onClick={() => {
                  setSelectedCrane(null);
                  navigate('/decision/simulator');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-subtle"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Simulate Impact & Run AI Recovery</span>
              </button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
