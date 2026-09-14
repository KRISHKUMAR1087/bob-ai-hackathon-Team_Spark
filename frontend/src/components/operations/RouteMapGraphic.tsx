import React, { useState } from 'react';
import {
  Ship,
  Anchor,
  Navigation,
  Wind,
  Waves,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Clock,
} from 'lucide-react';
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
  const [showWeatherLayer, setShowWeatherLayer] = useState(true);
  const [showShippingLanes, setShowShippingLanes] = useState(true);

  // Proportional percentages for responsive positioning across all screen widths
  const portPositions: Record<string, { left: string; top: string; name: string; tag: string }> = {
    'PORT-A': {
      left: '52%',
      top: '24%',
      name: 'Rotterdam Hub',
      tag: 'Current • Critical Bottleneck',
    },
    'PORT-B': {
      left: '78%',
      top: '46%',
      name: 'Antwerp Gateway',
      tag: 'Recommended • High Clearance',
    },
    'PORT-C': {
      left: '54%',
      top: '72%',
      name: 'Zeebrugge Deepwater',
      tag: 'Contingency Alternative',
    },
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border-subtle glass-card shadow-elevated transition-all duration-300">
      {/* 1. Header Toolbar Overlay */}
      <div className="p-4 sm:p-5 border-b border-border-subtle/80 flex flex-wrap items-center justify-between gap-3 bg-surface/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold shadow-sm">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-main">
                North Sea Maritime Vector Routing
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                AIS LIVE
              </span>
            </div>
            <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
              <span>Transit Corridor: <strong>Sector 04-B</strong></span>
              <span>•</span>
              <span>Approaching: <strong>MV Ocean Star</strong> (18.4 kts • HDG 112°)</span>
            </div>
          </div>
        </div>

        {/* Layer Switches & Nautical Conditions */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-surface-subtle/80 border border-border-subtle text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-brand-teal" />
              <span>14 kts NW</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-sky-500" />
              <span>Swell 1.2m</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>Tidal: 17.5m CD</span>
            </div>
          </div>

          <button
            onClick={() => setShowWeatherLayer(!showWeatherLayer)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showWeatherLayer
                ? 'bg-brand-teal/15 text-brand-teal border-brand-teal/40'
                : 'bg-surface text-text-muted border-border-subtle hover:bg-surface-subtle'
            }`}
            title="Toggle Weather Layer"
          >
            Weather
          </button>

          <button
            onClick={() => setShowShippingLanes(!showShippingLanes)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showShippingLanes
                ? 'bg-brand-teal/15 text-brand-teal border-brand-teal/40'
                : 'bg-surface text-text-muted border-border-subtle hover:bg-surface-subtle'
            }`}
            title="Toggle AIS Shipping Lanes"
          >
            Lanes
          </button>
        </div>
      </div>

      {/* 2. Interactive Nautical Vector Map Canvas */}
      <div className="relative w-full h-[380px] sm:h-[420px] lg:h-[460px] bg-gradient-to-b from-slate-50/50 via-slate-100/30 to-slate-50/50 dark:from-[#081f2c] dark:via-[#0b2838] dark:to-[#071a24] overflow-hidden select-none">
        {/* SVG Vector Nautical Chart Graphics */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 460"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Nautical Grid */}
            <pattern id="nautical-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" className="text-slate-200/80 dark:text-slate-800/80" strokeWidth="0.8" />
              <circle cx="50" cy="50" r="1" fill="currentColor" className="text-slate-300 dark:text-slate-700" />
            </pattern>

            {/* Glowing route filters */}
            <filter id="teal-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#0EA5A8" floodOpacity="0.6" />
            </filter>
            <filter id="red-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#EF4444" floodOpacity="0.5" />
            </filter>

            {/* Linear Gradients */}
            <linearGradient id="route-recommended-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5A8" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#nautical-grid)" />

          {/* Coastline Contours & Shallow Water Estuary Outlines */}
          <path
            d="M 380 0 C 420 80, 490 100, 520 120 C 580 160, 680 170, 750 200 C 820 230, 890 220, 1000 240 L 1000 460 L 320 460 C 360 400, 420 380, 460 340 C 490 310, 460 260, 420 220 C 380 180, 360 110, 380 0 Z"
            fill="currentColor"
            className="text-slate-200/35 dark:text-[#102f3d]/40"
            stroke="currentColor"
            strokeWidth="1.5"
          />

          {/* Bathymetric 20m Depth Curve */}
          <path
            d="M 220 0 C 260 120, 310 180, 340 240 C 370 300, 410 360, 430 460"
            fill="none"
            stroke="currentColor"
            className="text-teal-500/25 dark:text-teal-400/20"
            strokeWidth="1.2"
            strokeDasharray="6 4"
          />

          {/* AIS Separation TSS Shipping Lanes */}
          {showShippingLanes && (
            <path
              d="M 60 160 C 250 140, 450 110, 720 180 C 840 220, 920 260, 1000 300"
              fill="none"
              stroke="currentColor"
              className="text-sky-400/20 dark:text-sky-400/15"
              strokeWidth="14"
            />
          )}

          {/* ========================================= */}
          {/* ROUTE VECTORS FROM ORIGIN (120, 180) */}
          {/* ========================================= */}

          {/* 1. ROUTE TO ROTTERDAM (PORT-A: 520, 110) - Critical Congestion Red */}
          <path
            d="M 120 180 C 260 110, 380 90, 520 110"
            fill="none"
            stroke="#EF4444"
            strokeWidth={selectedPortCode === 'PORT-A' ? '4' : '2.5'}
            strokeDasharray="6 6"
            filter={selectedPortCode === 'PORT-A' ? 'url(#red-glow)' : undefined}
          />

          {/* 2. ROUTE TO ANTWERP GATEWAY (PORT-B: 780, 210) - Recommended Green/Teal */}
          <path
            d="M 120 180 C 340 220, 540 230, 780 210"
            fill="none"
            stroke="url(#route-recommended-grad)"
            strokeWidth={selectedPortCode === 'PORT-B' ? '5' : '3.5'}
            filter="url(#teal-glow)"
          />

          {/* 3. ROUTE TO ZEEBRUGGE (PORT-C: 540, 330) - Contingency Blue */}
          <path
            d="M 120 180 C 260 260, 380 340, 540 330"
            fill="none"
            stroke="#64748B"
            strokeWidth={selectedPortCode === 'PORT-C' ? '4' : '2.5'}
            strokeDasharray="5 5"
          />

          {/* Vector Directional Waypoint Markers */}
          <circle cx="320" cy="135" r="3" fill="#EF4444" opacity="0.8" />
          <circle cx="440" cy="215" r="4" fill="#0EA5A8" opacity="0.9" />
          <circle cx="340" cy="275" r="3" fill="#64748B" opacity="0.7" />
        </svg>

        {/* Approaching Vessel Marker: MV Ocean Star */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 group cursor-pointer"
          style={{ left: '12%', top: '39%' }}
        >
          <div className="relative">
            {/* Animated sonar radar ring */}
            <span className="absolute -inset-2 rounded-full bg-brand-teal/30 animate-ping" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 border-2 border-white dark:border-slate-800">
              <Ship className="w-5 h-5" />
            </div>
          </div>

          <div className="hidden sm:block px-3 py-1.5 rounded-xl glass-card text-xs">
            <div className="font-bold text-text-main flex items-center gap-1.5">
              <span>MV Ocean Star</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-brand-teal/15 text-brand-teal rounded">
                18.4 kts
              </span>
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              Offshore North Sea Waypoint
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* INTERACTIVE PORT HUB PINS ACROSS MAP */}
        {/* ========================================= */}
        {routes.map((port) => {
          const isSelected = selectedPortCode === port.portCode;
          const pos = portPositions[port.portCode] || { left: '50%', top: '50%', name: port.portName, tag: '' };

          return (
            <div
              key={port.portCode}
              onClick={() => onSelectPort(port.portCode)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-all duration-200 ${
                isSelected ? 'scale-105 z-30' : 'opacity-95 hover:opacity-100 hover:scale-102'
              }`}
              style={{ left: pos.left, top: pos.top }}
            >
              {/* Card Pin Container */}
              <div
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 glass-card shadow-lg ${
                  port.isRecommended
                    ? 'border-emerald-400/90 ring-2 ring-emerald-400/30 glow-teal'
                    : port.riskLevel === 'Critical'
                    ? 'border-rose-400/80 ring-2 ring-rose-400/20'
                    : 'border-border-subtle hover:border-brand-teal/60'
                } ${isSelected ? 'ring-3 ring-brand-teal shadow-2xl' : ''}`}
              >
                {/* Port Icon / Beacon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                    port.isRecommended
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-sm'
                      : port.riskLevel === 'Critical'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Anchor className="w-4 h-4" />
                </div>

                {/* Port Info & Telemetry */}
                <div className="min-w-[130px] sm:min-w-[150px]">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-text-main truncate">
                      {port.portName.split(' ')[0]}
                    </span>
                    {port.isRecommended ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        RECOMMENDED
                      </span>
                    ) : port.riskLevel === 'Critical' ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        BOTTLENECK
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        CONTINGENCY
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-text-muted mt-1 font-medium">
                    <span className={port.delayHours > 25 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
                      Delay: {port.delayHours}h
                    </span>
                    <span>•</span>
                    <span>{port.distanceNm} NM</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Status & Demurrage Summary */}
      <div className="p-3 sm:p-4 border-t border-border-subtle/80 bg-surface/50 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-teal shrink-0" />
          <span>
            Click any port hub on the chart to inspect <strong>demurrage exposure</strong>, <strong>fuel consumption</strong>, and <strong>turnaround guarantees</strong>.
          </span>
        </div>
        <span className="text-text-main font-semibold self-end sm:self-auto shrink-0">
          Estimated Demurrage Avoidance: <strong className="text-emerald-600 font-bold">+$148,000 USD</strong>
        </span>
      </div>
    </div>
  );
};
