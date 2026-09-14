import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  CheckCircle2,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { BeforeAfterCard } from '../components/operations/BeforeAfterCard';

export const OptimizerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    optimization,
    applyOptimization,
    isOptimizationApplied,
    setIsCopilotOpen,
    sendCopilotMessage,
  } = useOperations();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApply = () => {
    applyOptimization();
  };

  const handleAskCopilot = async () => {
    setIsCopilotOpen(true);
    await sendCopilotMessage('Why was Ocean Star moved from Berth B04 to B02 in the optimization plan?');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              Operations Optimizer
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              Quayside Dispatch Model
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Algorithmic berth and crane rebalancing to minimize vessel turnaround delays and demurrage penalties.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAskCopilot}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span>Explain with Gemini</span>
          </button>

          {!isOptimizationApplied ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <Zap className="w-4 h-4" />
              <span>Apply Recommendation</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recommendation Applied</span>
            </div>
          )}
        </div>
      </div>

      {/* Applied Banner if already executed */}
      {isOptimizationApplied && (
        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                Optimization Plan Active Across Port
              </span>
              <p className="text-xs text-text-muted mt-0.5">
                Ocean Star has been routed to Berth B02. Expected turnaround wait reduced by 4.6 hours, saving an estimated $148,000 in demurrage.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/operations')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <Calendar className="w-3.5 h-3.5 text-brand-teal" />
            <span>View on Operations Board</span>
          </button>
        </div>
      )}

      {/* Primary Before / After Comparison */}
      <BeforeAfterCard
        title="Berth & Crane Assignment Comparison"
        beforeTitle="Current Plan"
        afterTitle="Recommended Plan"
        beforeDetails={{
          berth: 'Berth B04 (Bottleneck)',
          vessel: 'Ocean Star (21,000 TEU)',
          cranes: 3,
          status: 'C03 failure causes crane bottleneck and queue delay',
        }}
        afterDetails={{
          berth: 'Berth B02 (Optimal)',
          vessel: 'Ocean Star (21,000 TEU)',
          cranes: 4,
          status: '4 active STS cranes available immediately',
        }}
        metrics={[
          {
            label: 'Expected Wait Time',
            before: '11.4h',
            after: '6.8h',
            delta: '-4.6 hours (-40%)',
            isPositive: true,
          },
          {
            label: 'B04 Utilization',
            before: '94%',
            after: '78%',
            delta: '-16% (Cleared)',
            isPositive: true,
          },
          {
            label: 'Quayside Queue',
            before: '7 vessels',
            after: '4 vessels',
            delta: '-3 vessels',
            isPositive: true,
          },
          {
            label: 'Demurrage Avoidance',
            before: '$0',
            after: '$148,000',
            delta: '+$148k Savings',
            isPositive: true,
          },
        ]}
      />

      {/* Rationale & Operator Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-6 rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
          <h3 className="text-sm font-semibold text-text-main border-b border-border-subtle pb-3">
            Optimization Rationale
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            {optimization.rationale}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
            <div className="bg-surface-subtle p-3.5 rounded-lg border border-border-subtle">
              <span className="text-text-muted text-[11px]">Draught Compatibility</span>
              <div className="font-semibold text-text-main mt-1">17.5m Depth at B02</div>
              <div className="text-[11px] text-text-muted mt-0.5">
                Accommodates 16.2m draught of Ocean Star with safe under-keel clearance.
              </div>
            </div>
            <div className="bg-surface-subtle p-3.5 rounded-lg border border-border-subtle">
              <span className="text-text-muted text-[11px]">Crane Productivity</span>
              <div className="font-semibold text-text-main mt-1">102 Moves / Hour (4 STS)</div>
              <div className="text-[11px] text-text-muted mt-0.5">
                Boosts handling rate by 38% compared to the restricted berth B04.
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-surface p-6 rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-text-main border-b border-border-subtle pb-3">
              Operator Decision
            </h3>
            <p className="text-xs text-text-muted mt-2.5 leading-relaxed">
              Applying this recommendation automatically reroutes Ocean Star on AIS and updates stevedore gang schedules.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-border-subtle">
            {!isOptimizationApplied ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <Zap className="w-4 h-4" />
                <span>Apply Recommendation</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Active Across All Modules</span>
              </button>
            )}

            <button
              onClick={() => navigate('/operations')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors"
            >
              <span>View Operations Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleApply}
        title="Apply optimized berth assignment?"
        description="Expected waiting time decreases from 11.4h to 6.8h. Ocean Star will be assigned to Berth B02 with 4 STS cranes."
        confirmLabel="Apply Plan"
        cancelLabel="Cancel"
        type="success"
      />
    </div>
  );
};

