import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ship,
  Anchor,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  PlusCircle,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RiskBadge } from '../../components/common/RiskBadge';

export const ShippingDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vessels, isOptimizationApplied, berthRequests } = useOperations();

  // Filter vessels belonging to agent (or all demo fleet)
  const agentVessels = vessels.filter(
    v => !v.ownerId || v.ownerId === user?.id || v.ownerId === 'demo-agent'
  );

  const arrivingCount = agentVessels.filter(v => v.status === 'Arriving').length;
  const atPortCount = agentVessels.filter(v => ['Berthing', 'Loading'].includes(v.status)).length;
  const delayedCount = agentVessels.filter(v => v.demurrageRisk === 'High' || v.status === 'Delayed').length;
  const departedCount = agentVessels.filter(v => v.status === 'Completed').length;


  const pendingRequestsCount = berthRequests.filter(r => r.status === 'Pending').length;

  // Agent name
  const agentDisplayName = user?.name || 'Demo Shipping Agent';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 min-w-0">
      {/* 1. Header with Personalized Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              Good morning, {agentDisplayName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              Agency Operations
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Manage your vessels and stay ahead of port operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/shipping/vessels/add')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Vessel</span>
          </button>
          <button
            onClick={() => navigate('/shipping/berth-requests')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer"
          >
            <Anchor className="w-3.5 h-3.5 text-text-caption" />
            <span>Berth Requests {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}</span>
          </button>
          <button
            onClick={() => navigate('/shipping/copilot')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* 2. My Fleet Operational Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs hover:shadow-md transition-all duration-200">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Total Fleet
          </div>
          <div className="text-2xl font-bold text-text-main mt-1.5">
            {agentVessels.length}
          </div>
          <div className="text-[10px] text-text-caption mt-0.5">Assigned vessels</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs hover:shadow-md transition-all duration-200">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Arriving
          </div>
          <div className="text-2xl font-bold text-sky-600 mt-1.5">
            {arrivingCount}
          </div>
          <div className="text-[10px] text-text-caption mt-0.5">Inbound next 48h</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs hover:shadow-md transition-all duration-200">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            At Port
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1.5">
            {atPortCount}
          </div>
          <div className="text-[10px] text-text-caption mt-0.5">Berthing & loading</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs hover:shadow-md transition-all duration-200">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Delayed / At Risk
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1.5">
            {isOptimizationApplied ? 0 : delayedCount}
          </div>
          <div className="text-[10px] text-text-caption mt-0.5">
            {isOptimizationApplied ? 'Resolved by optimizer' : 'Demurrage alert'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-subtle shadow-xs hover:shadow-md transition-all duration-200 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Departed
          </div>
          <div className="text-2xl font-bold text-text-muted mt-1.5">
            {departedCount}
          </div>
          <div className="text-[10px] text-text-caption mt-0.5">Completed calls</div>
        </div>
      </div>

      {/* 3. Important Operational Actions Banner */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-text-main uppercase tracking-wider">
          Action Required & Key Notifications
        </h2>

        {agentVessels.length === 0 && user?.authProvider !== 'demo' ? (
          <div className="p-4 rounded-xl bg-surface border border-border-subtle flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-text-main">No Active Fleet Registered</div>
                <p className="text-[11px] text-text-muted">Register your first vessel to request berths and track arrival telemetry in real time.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/shipping/vessels/add')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors shrink-0 cursor-pointer"
            >
              Add Vessel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Action 1: Reassignment / Demurrage */}
            {isOptimizationApplied ? (
              <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-emerald-900">
                      Berth Reassignment Confirmed
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      <strong>{agentVessels[0]?.name || 'Ocean Star'}</strong> reallocated to <strong>Berth B02</strong> with 4 cranes. Waiting time cut from 11.4h to <strong>6.8h</strong>.
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-medium">B02 Ready</span>
                  <button
                    onClick={() => navigate(`/shipping/vessels/${agentVessels[0]?.id || 'VES-01'}`)}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    View Details <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-amber-900">
                      High Congestion Expected at B04
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      <strong>{agentVessels[0]?.name || 'Ocean Star'}</strong> faces projected 11.4h turnaround delay. Port authority optimization is pending.
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-amber-700 font-medium">11.4h Wait Risk</span>
                  <button
                    onClick={() => navigate('/shipping/berth-requests')}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                  >
                    Check Request <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Action 2: Document Missing */}
            <div className="p-3.5 rounded-lg bg-surface border border-border-subtle flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-text-main">
                    Advance Arrival Notice Required
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                    <strong>{agentVessels[1]?.name || 'Pacific Voyager'}</strong> requires customs 72h advance notice filing prior to outer anchorage entry.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-border-subtle flex items-center justify-between">
                <span className="text-[10px] text-rose-600 font-medium">Filing Overdue</span>
                <button
                  onClick={() => navigate('/shipping/documents')}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                >
                  Upload Notice <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Action 3: ETA Confirmation */}
            <div className="p-3.5 rounded-lg bg-surface border border-border-subtle flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-text-main">
                    ETA Confirmation Needed
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                    Weather squalls reported in eastern fairway. Review updated passage speed for incoming fleet.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-border-subtle flex items-center justify-between">
                <span className="text-[10px] text-text-muted font-medium">Channel Monitoring</span>
                <button
                  onClick={() => navigate('/shipping/schedules')}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                >
                  Review Schedules <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Upcoming Arrivals Table */}
      <div className="bg-surface rounded-lg border border-border-subtle overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="w-4 h-4 text-sky-600" />
            <h2 className="text-xs font-semibold text-text-main uppercase tracking-wider">
              Upcoming Inbound & Active Vessels ({agentVessels.length})
            </h2>
          </div>
          <button
            onClick={() => navigate('/shipping/vessels')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            View All Fleet <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle/50 text-[11px] text-text-muted uppercase">
                <th className="py-2.5 px-4 font-semibold">Vessel</th>
                <th className="py-2.5 px-4 font-semibold">Voyage / IMO</th>
                <th className="py-2.5 px-4 font-semibold">ETA / ETD</th>
                <th className="py-2.5 px-4 font-semibold">Berth</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold">Congestion Risk</th>
                <th className="py-2.5 px-4 font-semibold">Expected Wait</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-main">
              {agentVessels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-text-muted">
                    No active vessels registered yet. Click <strong className="text-sky-600 font-semibold cursor-pointer" onClick={() => navigate('/shipping/vessels/add')}>Add Vessel</strong> to add your first vessel to the fleet.
                  </td>
                </tr>
              ) : (
                agentVessels.map(v => {
                const isOceanStar = v.id === 'VES-01';
                const waitTime = isOceanStar && isOptimizationApplied ? 6.8 : v.predictedWaitHours;
                const berthDisplay = isOceanStar && isOptimizationApplied ? 'B02' : (v.assignedBerth || v.requestedBerth || 'TBD');

                return (
                  <tr
                    key={v.id}
                    className="hover:bg-surface-subtle/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-[11px] shrink-0 border border-sky-100">
                          {v.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-text-main">{v.name}</div>
                          <div className="text-[10px] text-text-muted">{v.flag} • {v.vesselType || 'ULCV'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-text-main">{v.voyageNumber || 'APX-01'}</div>
                      <div className="text-[10px] text-text-caption font-mono">IMO {v.imo}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-text-main font-medium">{v.eta}</div>
                      <div className="text-[10px] text-text-muted">{v.etd}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-subtle border border-border-subtle font-mono text-[11px] font-semibold text-text-main">
                        <Anchor className="w-3 h-3 text-sky-600" />
                        {berthDisplay}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} />
                    </td>

                    <td className="py-3 px-4">
                      <RiskBadge risk={isOceanStar && isOptimizationApplied ? 'Low' : v.demurrageRisk} />
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`font-semibold ${
                          waitTime > 10 ? 'text-rose-600' : waitTime > 4 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {waitTime}h
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/shipping/vessels/${v.id}`)}
                        className="px-2.5 py-1 rounded bg-surface-subtle hover:bg-sky-50 text-sky-800 hover:text-sky-900 border border-border-subtle font-medium text-[11px] transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Quick Operational Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => navigate('/shipping/schedules')}
          className="p-4 rounded-lg bg-surface border border-border-subtle hover:border-sky-300 transition-all cursor-pointer group shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-text-main">Schedules & ETA Management</h3>
          <p className="text-[11px] text-text-muted mt-1">
            Update voyage arrival windows and track berth turnarounds.
          </p>
        </div>

        <div
          onClick={() => navigate('/shipping/berth-requests')}
          className="p-4 rounded-lg bg-surface border border-border-subtle hover:border-sky-300 transition-all cursor-pointer group shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <Anchor className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-text-main">Berth Requests</h3>
          <p className="text-[11px] text-text-muted mt-1">
            Request quayside berths, select arrival windows, and review status.
          </p>
        </div>

        <div
          onClick={() => navigate('/shipping/cargo')}
          className="p-4 rounded-lg bg-surface border border-border-subtle hover:border-sky-300 transition-all cursor-pointer group shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-text-main">Cargo Operations</h3>
          <p className="text-[11px] text-text-muted mt-1">
            Monitor container loading progress, hazardous cargo, and manifests.
          </p>
        </div>

        <div
          onClick={() => navigate('/shipping/documents')}
          className="p-4 rounded-lg bg-surface border border-border-subtle hover:border-sky-300 transition-all cursor-pointer group shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-text-main">Document Repository</h3>
          <p className="text-[11px] text-text-muted mt-1">
            Upload Bills of Lading, crew manifests, and dangerous goods declarations.
          </p>
        </div>
      </div>
    </div>
  );
};

