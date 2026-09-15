import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MetricItem {
  label: string;
  before: string | number;
  after: string | number;
  delta?: string;
  isPositive?: boolean;
}

interface BeforeAfterCardProps {
  title: string;
  beforeTitle: string;
  afterTitle: string;
  metrics: MetricItem[];
  beforeDetails?: {
    berth: string;
    vessel: string;
    cranes: number;
    status: string;
  };
  afterDetails?: {
    berth: string;
    vessel: string;
    cranes: number;
    status: string;
  };
}

export const BeforeAfterCard: React.FC<BeforeAfterCardProps> = ({
  title,
  beforeTitle,
  afterTitle,
  metrics,
  beforeDetails,
  afterDetails,
}) => {
  return (
    <div className="bg-surface rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-main">
          {title}
        </h3>
        <span className="text-xs text-text-caption">
          Predictive Optimization Model
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: BEFORE / CURRENT */}
        <div className="p-5 rounded-lg bg-surface-subtle/70 border border-border-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <span className="text-xs font-semibold text-text-main flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {beforeTitle}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              Bottleneck
            </span>
          </div>

          {beforeDetails && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Assigned Berth:</span>
                <span className="font-semibold text-text-main">{beforeDetails.berth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Target Vessel:</span>
                <span className="text-text-main">{beforeDetails.vessel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Allocated Cranes:</span>
                <span className="text-text-main">{beforeDetails.cranes} STS Cranes</span>
              </div>
              <div className="text-[11px] text-text-muted pt-1">
                {beforeDetails.status}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AFTER / RECOMMENDED */}
        <div className="p-5 rounded-lg bg-emerald-50/30 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
            <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {afterTitle}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
              Optimized
            </span>
          </div>

          {afterDetails && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Assigned Berth:</span>
                <span className="font-semibold text-emerald-800">{afterDetails.berth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Target Vessel:</span>
                <span className="text-text-main">{afterDetails.vessel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Allocated Cranes:</span>
                <span className="font-semibold text-emerald-800">{afterDetails.cranes} STS Cranes (+1)</span>
              </div>
              <div className="text-[11px] text-emerald-700 pt-1">
                {afterDetails.status}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row Comparison */}
      <div className="px-6 pb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-surface-subtle p-3.5 rounded-lg border border-border-subtle">
            <div className="text-xs text-text-muted">{m.label}</div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-xs text-text-caption line-through">{m.before}</span>
              <ArrowRight className="w-3 h-3 text-text-caption shrink-0" />
              <span className="text-sm lg:text-base font-bold text-text-main">
                {m.after}
              </span>
            </div>
            {m.delta && (
              <div
                className={`text-[11px] mt-1 font-medium ${
                  m.isPositive ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {m.delta}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

