import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Ship,
  Clock,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { Drawer } from '../common/Drawer';

export interface TimelineBlock {
  id: string;
  name: string;
  details: string;
  startCol: number; // 0 to 5
  span: number;     // 1 to 6
  status: 'normal' | 'warning' | 'bottleneck' | 'optimized' | 'available';
  vesselId: string | null;
  timeWindow: string;
  cranes: string;
  notes?: string;
}

export const TimelineGantt: React.FC = () => {
  const navigate = useNavigate();
  const {
    berths,
    isOptimizationApplied,
    isRecoveryPlanApplied,
  } = useOperations();

  const [inspectedBlock, setInspectedBlock] = useState<TimelineBlock | null>(null);

  // Time header intervals (Simplified as requested: 06:00, 12:00, 18:00, 00:00, 06:00, 12:00)
  const timeColumns = [
    { time: '06:00', shift: 'Shift 1' },
    { time: '12:00', shift: 'Shift 2' },
    { time: '18:00', shift: 'Shift 3' },
    { time: '00:00', shift: 'Night' },
    { time: '06:00', shift: '+1d Shift 1' },
    { time: '12:00', shift: '+1d Shift 2' },
  ];

  // Helper to generate continuous blocks per berth
  const getBerthSchedule = (berthId: string): {
    blocks: TimelineBlock[];
    type: string;
    rightStatus: { title: string; subtitle: string; isAlert?: boolean; isOptimized?: boolean };
  } => {
    switch (berthId) {
      case 'B01':
        return {
          type: 'Deepwater North',
          rightStatus: { title: 'On Schedule', subtitle: 'Turnaround 18:00' },
          blocks: [
            {
              id: 'b01-vessel',
              name: 'MSC Orion (16,500 TEU)',
              details: 'C01, C02 • 68% complete',
              startCol: 0,
              span: 4,
              status: 'normal',
              vesselId: 'VES-02',
              timeWindow: '06:00 – 06:00 (+1d)',
              cranes: 'C01, C02 (STS Heavy)',
              notes: 'Discharge operations running within standard productivity metrics (28 moves/hour).',
            },
            {
              id: 'b01-buffer',
              name: 'Available Quayside',
              details: 'Buffer window • 380m',
              startCol: 4,
              span: 2,
              status: 'available',
              vesselId: null,
              timeWindow: '06:00 (+1d) – 18:00 (+1d)',
              cranes: 'Standby',
            },
          ],
        };

      case 'B02':
        if (isOptimizationApplied || isRecoveryPlanApplied) {
          return {
            type: 'Deepwater Central',
            rightStatus: { title: 'Flow Optimized', subtitle: '-4.6h wait saved', isOptimized: true },
            blocks: [
              {
                id: 'b02-maersk-opt',
                name: 'Maersk Mc-Kinney',
                details: 'C04, C06 • Completed 14:00',
                startCol: 0,
                span: 2,
                status: 'normal',
                vesselId: 'VES-03',
                timeWindow: '06:00 – 18:00',
                cranes: 'C04, C06',
                notes: 'Discharge expedited. Quayside cleared for MV Ocean Star arrival.',
              },
              {
                id: 'b02-ocean-star-opt',
                name: 'Ocean Star (Optimized)',
                details: 'C04, C06 (+2 STS) • 6.8h wait (-4.6h)',
                startCol: 2,
                span: 4,
                status: 'optimized',
                vesselId: 'VES-01',
                timeWindow: '18:00 – 18:00 (+1d)',
                cranes: 'C04, C06 (+2 STS Cranes Priority)',
                notes: 'Reassigned from Berth B04. Demurrage avoided: $148,000. Wait time reduced to 6.8h.',
              },
            ],
          };
        }
        return {
          type: 'Deepwater Central',
          rightStatus: { title: 'On Schedule', subtitle: 'Turnaround 04:30' },
          blocks: [
            {
              id: 'b02-maersk',
              name: 'Maersk Mc-Kinney (18,270 TEU)',
              details: 'C04, C06 • 42% discharged',
              startCol: 0,
              span: 4,
              status: 'normal',
              vesselId: 'VES-03',
              timeWindow: '06:00 – 06:00 (+1d)',
              cranes: 'C04, C06',
              notes: 'Standard operations ongoing. Scheduled departure tomorrow 04:30.',
            },
            {
              id: 'b02-avail',
              name: 'Available Quayside',
              details: '320m berth window',
              startCol: 4,
              span: 2,
              status: 'available',
              vesselId: null,
              timeWindow: '06:00 (+1d) – 18:00 (+1d)',
              cranes: 'Standby',
            },
          ],
        };

      case 'B03':
        return {
          type: 'Feeder & Transshipment',
          rightStatus: { title: 'Active Feeder', subtitle: 'C07 in service' },
          blocks: [
            {
              id: 'b03-service',
              name: 'C07 Service Window',
              details: 'C07 • Preventative inspection',
              startCol: 0,
              span: 1,
              status: 'warning',
              vesselId: null,
              timeWindow: '06:00 – 12:00',
              cranes: 'C07 (Maintenance)',
              notes: 'Scheduled 6-hour preventative electrical check on Crane C07 trolley.',
            },
            {
              id: 'b03-radiant',
              name: 'Ever Radiant',
              details: 'C07 • Scheduled discharge',
              startCol: 1,
              span: 3,
              status: 'normal',
              vesselId: 'VES-04',
              timeWindow: '12:00 – 06:00 (+1d)',
              cranes: 'C07 (Active)',
              notes: 'Feeder connection scheduled for transshipment containers from B01.',
            },
            {
              id: 'b03-hapag',
              name: 'Hapag Express',
              details: 'C07 • En route (ETA 07:30)',
              startCol: 4,
              span: 2,
              status: 'normal',
              vesselId: 'VES-07',
              timeWindow: '06:00 (+1d) – 18:00 (+1d)',
              cranes: 'C07 (Active)',
              notes: 'Arriving regional feeder with 850 TEU import cargo.',
            },
          ],
        };

      case 'B04':
        if (isOptimizationApplied || isRecoveryPlanApplied) {
          return {
            type: 'Ultra-Large Container',
            rightStatus: { title: 'Risk Mitigated', subtitle: 'Controlled at 78%', isOptimized: true },
            blocks: [
              {
                id: 'b04-repair-buffer',
                name: 'C03 Repair & Buffer',
                details: 'Technician dispatched • ETA 14:00',
                startCol: 0,
                span: 3,
                status: 'normal',
                vesselId: null,
                timeWindow: '06:00 – 00:00',
                cranes: 'C03 (Under repair)',
                notes: 'Quay clear of congestion. Crane C03 electrical servicing underway.',
              },
              {
                id: 'b04-forward-opt',
                name: 'Ever Forward',
                details: 'Direct berthing • On schedule',
                startCol: 3,
                span: 3,
                status: 'optimized',
                vesselId: null,
                timeWindow: '00:00 – 18:00 (+1d)',
                cranes: 'C03 (Restored)',
                notes: 'Berthing safely without queue delay. Bottleneck cleared.',
              },
            ],
          };
        }
        return {
          type: 'Ultra-Large Container',
          rightStatus: { title: '11.4h Bottleneck', subtitle: 'Action required', isAlert: true },
          blocks: [
            {
              id: 'b04-ocean-star',
              name: 'Ocean Star',
              details: 'C03 unavailable • 11.4h expected wait',
              startCol: 0,
              span: 5,
              status: 'bottleneck',
              vesselId: 'VES-01',
              timeWindow: '06:00 – 12:00 (+1d)',
              cranes: 'C03 (FAULT - Unavailable)',
              notes: 'CRITICAL: Arrival bunching combined with C03 failure creates an 11.4h queue with $182,000 demurrage exposure.',
            },
            {
              id: 'b04-forward-delayed',
              name: 'Ever Forward',
              details: 'Cascade delay (+8.2h)',
              startCol: 5,
              span: 1,
              status: 'warning',
              vesselId: null,
              timeWindow: '12:00 (+1d) – 18:00 (+1d)',
              cranes: 'Delayed Window',
              notes: 'Vessel forced to wait at outer anchorage until B04 clears.',
            },
          ],
        };

      case 'B05':
        return {
          type: 'South Terminal A',
          rightStatus: { title: 'On Schedule', subtitle: 'Turnaround 22:00' },
          blocks: [
            {
              id: 'b05-voyager',
              name: 'Pacific Voyager (6,500 TEU)',
              details: isRecoveryPlanApplied
                ? 'C05 mobilized to B04 • +4h reschedule'
                : 'C05 • Scheduled loading',
              startCol: 0,
              span: 4,
              status: isRecoveryPlanApplied ? 'warning' : 'normal',
              vesselId: 'VES-05',
              timeWindow: '06:00 – 06:00 (+1d)',
              cranes: 'C05 STS Crane',
              notes: 'Standard bulk/container handling.',
            },
            {
              id: 'b05-avail',
              name: 'Available Quayside',
              details: '300m berth window',
              startCol: 4,
              span: 2,
              status: 'available',
              vesselId: null,
              timeWindow: '06:00 (+1d) – 18:00 (+1d)',
              cranes: 'Standby',
            },
          ],
        };

      case 'B06':
        return {
          type: 'South Terminal B',
          rightStatus: { title: 'On Schedule', subtitle: 'ETA 18:00' },
          blocks: [
            {
              id: 'b06-feeder',
              name: 'Inter-feeder Staging',
              details: 'C08 • Local transfer',
              startCol: 0,
              span: 2,
              status: 'normal',
              vesselId: null,
              timeWindow: '06:00 – 18:00',
              cranes: 'C08 STS Crane',
            },
            {
              id: 'b06-antoine',
              name: 'CMA CGM Antoine',
              details: 'C08 • Berthing (ETA 18:00)',
              startCol: 2,
              span: 4,
              status: 'normal',
              vesselId: 'VES-06',
              timeWindow: '18:00 – 18:00 (+1d)',
              cranes: 'C08 STS Crane',
              notes: 'Arriving from Singapore, scheduled 24h turnaround window.',
            },
          ],
        };

      default:
        return {
          type: 'Commercial Quay',
          rightStatus: { title: 'Active', subtitle: 'Standard window' },
          blocks: [],
        };
    }
  };

  // Block style mapping as required: flat, compact, subtle background, thin border, small radius, no glow
  const getBlockStyle = (status: TimelineBlock['status']) => {
    switch (status) {
      case 'bottleneck':
        return 'bg-rose-50/90 border-rose-300 text-rose-950 hover:bg-rose-100/80 shadow-xs';
      case 'warning':
        return 'bg-amber-50/85 border-amber-200 text-amber-950 hover:bg-amber-100/70 shadow-xs';
      case 'optimized':
        return 'bg-emerald-50/85 border-emerald-200 text-emerald-950 hover:bg-emerald-100/70 shadow-xs';
      case 'available':
        return 'border border-dashed border-border-subtle/80 bg-surface-subtle/30 text-text-caption hover:bg-surface-subtle/60';
      case 'normal':
      default:
        return 'bg-slate-50/90 border-slate-200 text-slate-800 hover:bg-slate-100/80 shadow-xs';
    }
  };

  const handleBlockClick = (block: TimelineBlock) => {
    if (block.vesselId) {
      setInspectedBlock(block);
    } else if (block.status === 'bottleneck') {
      navigate('/decision/optimizer');
    } else {
      setInspectedBlock(block);
    }
  };

  return (
    <>
      {/* 10. REMOVE UNNECESSARY CARDS: Single clean workspace surface with subtle borders */}
      <div className="bg-surface rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {/* Workspace Subheader: Horizon Context + Tiny Legend */}
        <div className="px-5 py-3 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 bg-surface">
          <div className="text-xs text-text-muted flex items-center gap-2">
            <span>Next 24–72 Hours Continuous Berthing Trajectory</span>
            <span className="text-text-caption">•</span>
            <span>6 Commercial Quays</span>
          </div>

          {/* 9. LEGEND: Very small, tiny colored indicators, no large pills */}
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300 border border-slate-400" />
              <span>Normal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 border border-amber-500" />
              <span>Warning</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 border border-rose-600" />
              <span>Bottleneck</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-600" />
              <span>Optimized</span>
            </span>
          </div>
        </div>

        {/* 13. RESPONSIVE BEHAVIOR: Horizontal scroll with sticky left Berth column */}
        <div className="overflow-x-auto w-full relative">
          {/* Scroll hint on mobile */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden z-20" />
          
          <div className="min-w-[800px] w-full select-none">
            {/* 8. TIME HEADER */}
            <div className="flex border-b border-border-subtle bg-surface-subtle/70 text-xs text-text-muted sticky top-0 z-20">
              {/* Berth Column Header */}
              <div className="w-40 sm:w-56 lg:w-60 shrink-0 px-3 py-2.5 font-semibold text-xs text-text-muted uppercase tracking-wider sticky left-0 bg-surface-subtle z-30 border-r border-border-subtle">
                Berth
              </div>

              {/* Time Interval Columns */}
              <div className="grid grid-cols-6 divide-x divide-border-subtle flex-1">
                {timeColumns.map((col, idx) => (
                  <div key={idx} className="px-2 lg:px-3 py-2 text-left">
                    <span className="font-semibold text-[10px] lg:text-xs text-text-main">{col.time}</span>
                    <span className="text-[9px] lg:text-[10px] text-text-caption block mt-0.5">{col.shift}</span>
                  </div>
                ))}
              </div>

              {/* Right Status Column Header */}
              <div className="w-44 shrink-0 px-4 py-2.5 font-semibold text-xs text-text-muted uppercase tracking-wider border-l border-border-subtle hidden lg:block">
                Status
              </div>
            </div>

            {/* 4. BERTH ROWS & 3. GANTT TIMELINE HERO */}
            <div className="divide-y divide-border-subtle">
              {berths.map(berth => {
                const schedule = getBerthSchedule(berth.id);
                const isB04 = berth.id === 'B04';
                const isB04HighRisk = isB04 && !isOptimizationApplied && !isRecoveryPlanApplied;
                const isB04Optimized = isB04 && (isOptimizationApplied || isRecoveryPlanApplied);

                return (
                  <div
                    key={berth.id}
                    className="flex items-stretch hover:bg-slate-50/40 transition-colors min-h-[86px]"
                  >
                    {/* LEFT: Clean Fixed Berth Column */}
                    <div className="w-40 sm:w-56 lg:w-60 shrink-0 px-3 py-3 sticky left-0 bg-white z-10 border-r border-border-subtle flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* 4. Berth name is the strongest text */}
                        <span className="font-bold text-xs sm:text-sm text-text-main">{berth.id}</span>
                        {/* 7. Only B04 receives warning emphasis */}
                        {isB04HighRisk && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            High Risk
                          </span>
                        )}
                        {isB04Optimized && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Mitigated
                          </span>
                        )}
                      </div>
                      {/* Location/type is secondary */}
                      <div className="text-xs text-text-muted mt-0.5 truncate">
                        {schedule.type}
                      </div>
                      {/* Utilization is small and quiet */}
                      <div className="text-[11px] mt-0.5">
                        {isB04HighRisk ? (
                          <span className="text-rose-600 font-medium">82% utilization</span>
                        ) : (
                          <span className="text-text-caption">
                            {isB04Optimized ? '64%' : `${berth.currentUtilization}%`} utilization
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CENTER: Timeline Grid with ONE Continuous Block per Vessel */}
                    <div className="relative grid grid-cols-6 gap-2 flex-1 p-2 items-center">
                      {/* Subtle background grid lines for the 6 shifts */}
                      <div className="absolute inset-0 grid grid-cols-6 divide-x divide-border-subtle/50 pointer-events-none" />

                      {/* 2. Continuous timeline blocks (NO repetitive cards per cell) */}
                      {schedule.blocks.map(block => (
                        <div
                          key={block.id}
                          style={{
                            gridColumnStart: block.startCol + 1,
                            gridColumnEnd: block.startCol + block.span + 1,
                          }}
                          onClick={() => handleBlockClick(block)}
                          className={`relative z-10 h-[66px] rounded-xl border p-2.5 flex flex-col justify-between cursor-pointer transition-all ${getBlockStyle(
                            block.status
                          )}`}
                          title={`${block.name} • ${block.details} (Click to inspect)`}
                        >
                          {/* 6. INFORMATION INSIDE VESSEL BLOCK: Only necessary info */}
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-semibold text-xs truncate">
                              {block.name}
                            </span>
                            {block.status === 'bottleneck' && (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                            {block.status === 'optimized' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-text-muted truncate">
                            {block.details}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* RIGHT: Compact status / turnaround */}
                    <div className="w-44 shrink-0 px-4 py-3 border-l border-border-subtle flex flex-col justify-center text-xs hidden lg:flex">
                      <span
                        className={`font-semibold ${
                          schedule.rightStatus.isAlert
                            ? 'text-rose-600'
                            : schedule.rightStatus.isOptimized
                            ? 'text-emerald-700'
                            : 'text-text-main'
                        }`}
                      >
                        {schedule.rightStatus.title}
                      </span>
                      <span className="text-[11px] text-text-muted mt-0.5">
                        {schedule.rightStatus.subtitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 12. INTERACTION: Detail Drawer for selected timeline block */}
      <Drawer
        isOpen={!!inspectedBlock}
        onClose={() => setInspectedBlock(null)}
        title={inspectedBlock?.name || 'Vessel Operations Detail'}
        width="max-w-md"
      >
        {inspectedBlock && (
          <div className="space-y-5 text-xs text-text-main">
            {/* Status overview */}
            <div className="p-3 rounded-lg border border-border-subtle bg-surface-subtle/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Operational State:</span>
                <span
                  className={`px-2 py-0.5 rounded font-semibold text-xs ${
                    inspectedBlock.status === 'bottleneck'
                      ? 'bg-rose-100 text-rose-800'
                      : inspectedBlock.status === 'optimized'
                      ? 'bg-emerald-100 text-emerald-800'
                      : inspectedBlock.status === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {inspectedBlock.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Scheduled Window:</span>
                <span className="font-semibold text-text-main flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  {inspectedBlock.timeWindow}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Crane Allocation:</span>
                <span className="font-semibold text-text-main">{inspectedBlock.cranes}</span>
              </div>
            </div>

            {/* Operational Notes */}
            {inspectedBlock.notes && (
              <div className="space-y-1.5">
                <span className="font-semibold text-text-main">Operational Notes:</span>
                <p className="text-text-muted leading-relaxed p-3 rounded bg-white border border-border-subtle">
                  {inspectedBlock.notes}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2 pt-3 border-t border-border-subtle">
              {inspectedBlock.vesselId && (
                <button
                  onClick={() => {
                    navigate(`/operations/vessels/${inspectedBlock.vesselId}`);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <Ship className="w-3.5 h-3.5" />
                  <span>Open Full Vessel Profile</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              )}

              {inspectedBlock.status === 'bottleneck' && (
                <button
                  onClick={() => navigate('/decision/optimizer')}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Launch Optimizer for B04</span>
                </button>
              )}

              <button
                onClick={() => setInspectedBlock(null)}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

