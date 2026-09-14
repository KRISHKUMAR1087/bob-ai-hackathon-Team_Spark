import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  RefreshCw,
} from 'lucide-react';
import { TimelineGantt } from '../components/operations/TimelineGantt';

export const OperationsBoardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Live Operations Board
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Real-time berthing windows, crane allocations, and vessel turnarounds.
          </p>
        </div>

        {/* Keep only two actions: Launch Optimizer (primary) and Simulate Disruption */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/decision/optimizer')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Optimizer</span>
          </button>
          <button
            onClick={() => navigate('/decision/simulator')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
            <span>Simulate Disruption</span>
          </button>
        </div>
      </div>

      {/* 3. Gantt Timeline Workspace (Single clean surface, no card-in-card nesting) */}
      <TimelineGantt />
    </div>
  );
};

