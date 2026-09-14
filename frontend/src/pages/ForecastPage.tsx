import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Sparkles,
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import { CongestionChart } from '../components/operations/CongestionChart';
import { RiskBadge } from '../components/common/RiskBadge';

export const ForecastPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    forecast,
    berths,
    isOptimizationApplied,
    setIsCopilotOpen,
    sendCopilotMessage,
  } = useOperations();

  const [selectedBerthId, setSelectedBerthId] = useState<string>('B04');
  const selectedBerth = berths.find(b => b.id === selectedBerthId) || berths[3];

  const handleExplainWithGemini = async () => {
    setIsCopilotOpen(true);
    await sendCopilotMessage(`Explain the congestion forecast and bottleneck drivers for Berth ${selectedBerthId}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              Congestion Forecast Engine
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              6h–72h Predictive Horizon
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Predictive bottleneck neural model trained on historical AIS trajectories, gate transactions, and weather tides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExplainWithGemini}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors shadow-subtle"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span>Explain with Gemini</span>
          </button>
          <button
            onClick={() => navigate('/decision/optimizer')}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-subtle"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Optimize {selectedBerthId}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Forecast Chart & Analysis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2 Cols: Interactive Recharts Visualization */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-card border border-border-subtle shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div>
              <h2 className="text-sm font-semibold text-text-main">
                Multi-Berth Saturation Curves (6h–72h)
              </h2>
              <span className="text-xs text-text-muted">
                Select any berth to inspect its predictive trajectory.
              </span>
            </div>
            <div className="text-xs text-text-caption">
              Updated: <strong className="text-text-main font-medium">Just now</strong>
            </div>
          </div>

          <CongestionChart
            selectedBerth={selectedBerthId}
            onSelectBerth={setSelectedBerthId}
            height={340}
          />

          {/* Quick Metrics of Selected Berth */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
            <div className="bg-surface-subtle p-3.5 rounded-lg border border-border-subtle">
              <span className="text-xs text-text-muted">Current Utilization</span>
              <div className="text-xl font-bold text-text-main mt-0.5">
                {selectedBerth.currentUtilization}%
              </div>
            </div>
            <div className="bg-surface-subtle p-3.5 rounded-lg border border-border-subtle">
              <span className="text-xs text-text-muted">Peak 24h Prediction</span>
              <div
                className={`text-xl font-bold mt-0.5 ${
                  selectedBerth.id === 'B04' && !isOptimizationApplied
                    ? 'text-rose-600'
                    : 'text-text-main'
                }`}
              >
                {selectedBerth.predictedUtilization}%
              </div>
            </div>
            <div className="bg-surface-subtle p-3.5 rounded-lg border border-border-subtle">
              <span className="text-xs text-text-muted">Model Confidence</span>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">
                {forecast.bottleneckConfidence}%
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Analysis Panel for Selected Berth */}
        <div className="bg-surface p-6 rounded-card border border-border-subtle shadow-subtle flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="text-xs text-text-muted">Target Quay</span>
                <h3 className="text-base font-semibold text-text-main">
                  {selectedBerth.name}
                </h3>
              </div>
              <RiskBadge
                level={
                  selectedBerth.id === 'B04' && !isOptimizationApplied
                    ? 'HIGH'
                    : selectedBerth.riskLevel
                }
              />
            </div>

            {/* B04 Trajectory Numbers */}
            {selectedBerth.id === 'B04' && (
              <div className="mt-4 p-4 rounded-lg bg-surface-subtle border border-border-subtle space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-main font-semibold">B04 Predicted Bottleneck</span>
                  <span className="text-text-caption">Horizon Breakdown</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="bg-surface p-2 rounded border border-border-subtle">
                    <div className="text-[11px] text-text-caption">Now</div>
                    <div className="font-semibold text-text-main mt-0.5">82%</div>
                  </div>
                  <div className="bg-surface p-2 rounded border border-border-subtle">
                    <div className="text-[11px] text-text-caption">6h</div>
                    <div className="font-semibold text-text-main mt-0.5">86%</div>
                  </div>
                  <div className="bg-surface p-2 rounded border border-border-subtle">
                    <div className="text-[11px] text-text-caption">12h</div>
                    <div className="font-semibold text-text-main mt-0.5">89%</div>
                  </div>
                  <div className="bg-surface p-2 rounded border border-rose-200 bg-rose-50/50">
                    <div className="text-[11px] text-rose-700">24h Peak</div>
                    <div className="font-bold text-rose-700 mt-0.5">94%</div>
                  </div>
                  <div className="bg-surface p-2 rounded border border-border-subtle">
                    <div className="text-[11px] text-text-caption">48h</div>
                    <div className="font-semibold text-text-main mt-0.5">88%</div>
                  </div>
                  <div className="bg-surface p-2 rounded border border-border-subtle">
                    <div className="text-[11px] text-text-caption">72h</div>
                    <div className="font-semibold text-text-main mt-0.5">79%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Drivers */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-main font-semibold">Root Cause Drivers</span>
                <span className="text-text-caption">Weighting</span>
              </div>

              <div className="space-y-2 text-xs">
                {forecast.drivers.map((d, idx) => (
                  <div key={idx} className="p-2.5 rounded-md bg-surface-subtle border border-border-subtle space-y-1">
                    <div className="flex justify-between">
                      <span className="text-text-main font-medium">{d.factor}</span>
                      <span className="font-semibold text-text-main">{d.percentage}%</span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      {d.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-border-subtle space-y-2">
            <button
              onClick={() => navigate('/decision/optimizer')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-subtle"
            >
              <Zap className="w-4 h-4" />
              <span>Optimize {selectedBerthId} Operations</span>
            </button>
            <button
              onClick={handleExplainWithGemini}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors"
            >
              <Sparkles className="w-4 h-4 text-brand-teal" />
              <span>Explain with Gemini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
