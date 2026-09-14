import React from 'react';
import { Ship, Anchor } from 'lucide-react';
import { RouteOption } from '../../types/operations';

interface RouteMapGraphicProps {
  routes: RouteOption[];
  selectedPortCode: string;
  onSelectPort: (portCode: string) => void;
}

export const RouteMapGraphic: React.FC<RouteMapGraphicProps> = ({
  routes,
  selectedPortCode,
  onSelectPort,
}) => {
  const originPoint = { x: 60, y: 150 };

  return (
    <div className="relative w-full h-80 bg-slate-50 rounded-card border border-border-subtle overflow-hidden p-5 flex flex-col justify-between shadow-subtle">
      {/* Background SVG vector nautical grid and routes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="nautical-grid-light" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#nautical-grid-light)" />

        {/* Route to Port A (Direct / High Risk) */}
        <path
          d={`M ${originPoint.x} ${originPoint.y} C 120 100, 150 120, ${routes[0]?.coordinates.x || 180} ${routes[0]?.coordinates.y || 140}`}
          fill="none"
          stroke="#F87171"
          strokeWidth="2"
          strokeDasharray="5 5"
        />

        {/* Route to Port B (Recommended / Optimal) */}
        <path
          d={`M ${originPoint.x} ${originPoint.y} C 180 200, 240 180, ${routes[1]?.coordinates.x || 320} ${routes[1]?.coordinates.y || 190}`}
          fill="none"
          stroke="#0EA5A8"
          strokeWidth="3"
        />

        {/* Route to Port C */}
        <path
          d={`M ${originPoint.x} ${originPoint.y} C 200 240, 360 260, ${routes[2]?.coordinates.x || 440} ${routes[2]?.coordinates.y || 260}`}
          fill="none"
          stroke="#94A3B8"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Top Map Status Overlay */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-md border border-border-subtle shadow-subtle">
          <Ship className="w-4 h-4 text-brand-teal" />
          <span className="text-xs text-text-main">
            Approaching Vessel: <strong className="text-text-main font-semibold">Ocean Star</strong> (ETA: 14:30)
          </span>
        </div>
        <span className="text-xs text-text-muted bg-surface px-2.5 py-1 rounded-md border border-border-subtle shadow-subtle">
          North Sea Transit Route 04-B
        </span>
      </div>

      {/* Interactive Port Nodes on Canvas */}
      <div className="relative z-10 w-full h-full my-auto">
        {/* Vessel Position Marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2"
          style={{ left: `${originPoint.x}px`, top: `${originPoint.y}px` }}
        >
          <div className="w-7 h-7 rounded-full bg-brand-teal text-white flex items-center justify-center shadow-subtle">
            <Ship className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Port Nodes */}
        {routes.map(port => {
          const isSelected = selectedPortCode === port.portCode;

          return (
            <div
              key={port.portCode}
              onClick={() => onSelectPort(port.portCode)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-150 ${
                isSelected ? 'scale-105 z-20' : 'z-10 opacity-90 hover:opacity-100'
              }`}
              style={{
                left: `${port.coordinates.x}px`,
                top: `${port.coordinates.y}px`,
              }}
            >
              {/* Port Card Pin */}
              <div
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border shadow-subtle transition-all ${
                  port.isRecommended
                    ? 'bg-surface border-emerald-300 ring-1 ring-emerald-400'
                    : port.riskLevel === 'Critical'
                    ? 'bg-surface border-rose-300'
                    : 'bg-surface border-border-subtle'
                } ${isSelected ? 'ring-2 ring-brand-teal' : ''}`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                    port.isRecommended
                      ? 'bg-emerald-50 text-emerald-700'
                      : port.riskLevel === 'Critical'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Anchor className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-text-main truncate">
                      {port.portName.split(' ')[0]}
                    </span>
                    {port.isRecommended && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-0.5">
                    <span>Delay: {port.delayHours}h</span>
                    <span>•</span>
                    <span
                      className={
                        port.riskLevel === 'Critical'
                          ? 'text-rose-600 font-medium'
                          : port.riskLevel === 'Medium'
                          ? 'text-emerald-700 font-medium'
                          : 'text-text-muted'
                      }
                    >
                      {port.riskLevel} Risk
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Map Controls Footer */}
      <div className="relative z-10 flex items-center justify-between text-xs text-text-muted bg-surface p-2.5 rounded-md border border-border-subtle shadow-subtle">
        <span>Click port pin to inspect demurrage, bunker expenses, and ETA delta.</span>
        <span className="text-text-main font-medium">Tidal Depth: 17.5m CD</span>
      </div>
    </div>
  );
};
