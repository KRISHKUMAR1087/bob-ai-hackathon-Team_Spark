import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import { RouteMapGraphic } from '../components/operations/RouteMapGraphic';
import { RiskBadge } from '../components/common/RiskBadge';

export const RoutesPage: React.FC = () => {
  const { routes, setIsCopilotOpen, sendCopilotMessage } = useOperations();
  const [selectedPortCode, setSelectedPortCode] = useState<string>('PORT-B');

  const handleAskGemini = async () => {
    setIsCopilotOpen(true);
    await sendCopilotMessage('Compare alternate routing options between Rotterdam and Antwerp Gateway.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              Route Intelligence & Alternate Port Matrix
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              Nautical Diversion Analysis
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Evaluate offshore diversion economics, bunker fuel trade-offs, and port turnaround guarantees.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAskGemini}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors shadow-subtle"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span>Ask Gemini Copilot</span>
          </button>
        </div>
      </div>

      {/* Vector Route Map Visualization */}
      <RouteMapGraphic
        routes={routes}
        selectedPortCode={selectedPortCode}
        onSelectPort={setSelectedPortCode}
      />

      {/* Alternate Ports Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {routes.map(port => {
          const isSelected = selectedPortCode === port.portCode;

          return (
            <div
              key={port.portCode}
              onClick={() => setSelectedPortCode(port.portCode)}
              className={`bg-surface p-5 rounded-card border cursor-pointer transition-all duration-150 hover:shadow-elevated flex flex-col justify-between space-y-4 shadow-subtle ${
                port.isRecommended
                  ? 'border-emerald-300 ring-1 ring-emerald-200'
                  : port.riskLevel === 'Critical'
                  ? 'border-rose-300'
                  : 'border-border-subtle hover:border-slate-300'
              } ${isSelected ? 'ring-2 ring-brand-teal' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-text-main">
                        {port.portName}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-caption">
                      {port.country} • {port.distanceNm} NM
                    </span>
                  </div>

                  {port.isRecommended ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Recommended
                    </span>
                  ) : (
                    <RiskBadge level={port.riskLevel} size="sm" />
                  )}
                </div>

                {/* Metrics */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Turnaround Delay:</span>
                    <span
                      className={`font-semibold ${
                        port.delayHours > 25 ? 'text-rose-600' : 'text-text-main'
                      }`}
                    >
                      {port.delayHours} hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Extra Fuel Cost:</span>
                    <span className="font-semibold text-text-main">
                      ${port.extraCostUsd.toLocaleString()} USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Congestion Index:</span>
                    <span className="font-semibold text-text-main">{port.congestionScore} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Projected Port ETA:</span>
                    <span className="text-text-main font-medium">{port.eta}</span>
                  </div>
                </div>

                {/* Recommendation Rationale */}
                <div className="mt-4 p-3.5 rounded-lg bg-surface-subtle text-[11px] text-text-muted leading-relaxed">
                  {port.rationale}
                </div>
              </div>

              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-brand-teal hover:underline font-medium">
                <span>Select Port</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendation Summary Banner */}
      <div className="bg-surface p-6 rounded-card border border-teal-200 bg-teal-50/20 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-brand-teal flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-teal-950 uppercase tracking-wider">
              Optimal Diversion Recommendation: Antwerp Gateway (PORT-B)
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-3xl">
              An additional <strong>+$10,000 USD</strong> in steaming fuel avoids <strong>13.0 hours</strong> of waiting anchorage delay and clears the critical B04 bottleneck, preventing $148,000 in demurrage.
            </p>
          </div>
        </div>

        <button
          onClick={handleAskGemini}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-subtle shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Gemini to Draft Notice</span>
        </button>
      </div>
    </div>
  );
};
