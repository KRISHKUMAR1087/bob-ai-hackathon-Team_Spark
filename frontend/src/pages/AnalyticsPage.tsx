import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Zap,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const trendData = [
    { day: 'W1', baselineWait: 14.8, aiWait: 9.2 },
    { day: 'W2', baselineWait: 16.2, aiWait: 10.4 },
    { day: 'W3', baselineWait: 15.0, aiWait: 8.9 },
    { day: 'W4', baselineWait: 13.9, aiWait: 7.6 },
  ];

  const berthSavingsData = [
    { berth: 'B01', standardTurnaround: 22.4, optimizedTurnaround: 18.2 },
    { berth: 'B02', standardTurnaround: 24.1, optimizedTurnaround: 17.5 },
    { berth: 'B03', standardTurnaround: 19.8, optimizedTurnaround: 16.4 },
    { berth: 'B04', standardTurnaround: 28.5, optimizedTurnaround: 19.2 },
    { berth: 'B05', standardTurnaround: 16.0, optimizedTurnaround: 13.8 },
    { berth: 'B06', standardTurnaround: 18.2, optimizedTurnaround: 15.1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Operational Analytics & Performance
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Audit trailing port efficiency, demurrage savings, and predictive ML accuracy metrics.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center bg-surface-subtle p-1 rounded-xl border border-border-subtle">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 text-xs rounded-xl transition-all ${
                dateRange === range
                  ? 'bg-surface text-text-main font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Featured AI Impact Banner */}
      <div className="bg-surface p-6 rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-main flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-teal" />
            Impact of PortPulse Optimization
          </span>
          <span className="text-xs text-text-caption">
            Audited over {dateRange.toUpperCase()} rolling period
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-surface-subtle p-4 rounded-lg border border-border-subtle flex items-center justify-between">
            <div>
              <span className="text-xs text-text-muted">Average Vessel Wait</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">-23%</div>
              <span className="text-[11px] text-text-caption">Reduced from 15.2h to 11.7h</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface-subtle p-4 rounded-lg border border-border-subtle flex items-center justify-between">
            <div>
              <span className="text-xs text-text-muted">Unplanned Congestion</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">-31%</div>
              <span className="text-[11px] text-text-caption">Fewer quayside delays</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface-subtle p-4 rounded-lg border border-border-subtle flex items-center justify-between">
            <div>
              <span className="text-xs text-text-muted">Berth Utilization</span>
              <div className="text-2xl font-bold text-text-main mt-1">+12%</div>
              <span className="text-[11px] text-text-caption">Balanced quay load</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Wait Time Trend */}
        <div className="bg-surface p-6 rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h3 className="text-sm font-semibold text-text-main">
              Vessel Waiting Time: Standard vs AI Optimized
            </h3>
            <span className="text-xs text-emerald-700 font-medium">Hours Wait</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="baselineWait"
                  name="Standard Operations"
                  stroke="#94A3B8"
                  fill="#F1F5F9"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="aiWait"
                  name="PortPulse AI"
                  stroke="#0EA5A8"
                  fill="#CCFBF1"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Turnaround Hours by Berth */}
        <div className="bg-surface p-6 rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h3 className="text-sm font-semibold text-text-main">
              Berth Turnaround Benchmark (Hours per Vessel)
            </h3>
            <span className="text-xs text-text-muted">Quays B01–B06</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={berthSavingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="berth" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    fontSize: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                />
                <Bar dataKey="standardTurnaround" name="Standard" fill="#CBD5E1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="optimizedTurnaround" name="PortPulse AI" fill="#0EA5A8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

