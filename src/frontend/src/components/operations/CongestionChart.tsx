import React, { useState } from 'react';
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import { useOperations } from '../../context/OperationsContext';
import { useTheme } from '../../context/ThemeContext';

interface CongestionChartProps {
  selectedBerth?: string;
  onSelectBerth?: (berthId: string) => void;
  height?: number;
}

export const CongestionChart: React.FC<CongestionChartProps> = ({
  selectedBerth = 'B04',
  onSelectBerth,
  height = 300,
}) => {
  const { forecast } = useOperations();
  const { isDark } = useTheme();
  const [horizon, setHorizon] = useState<'6h' | '12h' | '24h' | '48h' | '72h'>('24h');

  const getHorizonPoints = () => {
    if (!forecast?.points) return [];
    switch (horizon) {
      case '6h':
        return forecast.points.slice(0, 2);
      case '12h':
        return forecast.points.slice(0, 3);
      case '24h':
        return forecast.points.slice(0, 5);
      case '48h':
        return forecast.points.slice(0, 7);
      case '72h':
      default:
        return forecast.points;
    }
  };

  const chartData = getHorizonPoints();

  const berthColors: Record<string, string> = {
    B01: '#3B82F6', // Blue
    B02: '#10B981', // Emerald
    B03: '#F59E0B', // Amber
    B04: '#EF4444', // Red (Bottleneck)
    B05: '#64748B', // Slate
    B06: '#06B6D4', // Cyan
  };

  return (
    <div className="w-full space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Prediction Horizon:</span>
          <div className="flex items-center bg-surface-subtle p-1 rounded-xl border border-border-subtle">
            {(['6h', '12h', '24h', '48h', '72h'] as const).map(h => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-2.5 py-0.5 text-xs rounded transition-all ${
                  horizon === h
                    ? 'bg-white text-text-main font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Berth Selector Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['B01', 'B02', 'B03', 'B04', 'B05', 'B06'].map(bId => {
            const isSelected = selectedBerth === bId;
            return (
              <button
                key={bId}
                onClick={() => onSelectBerth?.(bId)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition-all border ${
                  isSelected
                    ? 'bg-white border-slate-300 text-text-main font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                    : 'bg-surface-subtle/60 border-border-subtle text-text-muted hover:text-text-main'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: berthColors[bId] }}
                />
                <span>{bId}</span>
                {bId === 'B04' && (
                  <span className="text-[10px] text-rose-600 font-medium">
                    Risk
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="bg-surface p-2 rounded-lg border border-border-subtle">
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1D4655' : '#F1F5F9'} vertical={false} />
              <XAxis
                dataKey="hour"
                stroke={isDark ? '#607C87' : '#94A3B8'}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: isDark ? '#1D4655' : '#E2E8F0' }}
              />
              <YAxis
                domain={[40, 100]}
                stroke={isDark ? '#607C87' : '#94A3B8'}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-surface border border-border-subtle p-3 rounded-lg shadow-elevated text-xs space-y-1.5">
                        <div className="text-text-muted border-b border-border-subtle pb-1 font-medium">
                          Time Horizon: {label}
                        </div>
                        {payload.map((entry: any) => (
                          <div
                            key={entry.name}
                            className="flex items-center justify-between gap-4 text-xs"
                          >
                            <span style={{ color: entry.color }} className="flex items-center gap-1.5 font-medium">
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: entry.color }}
                              />
                              {entry.name}:
                            </span>
                            <span className="font-semibold text-text-main">{entry.value}%</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Warning Threshold */}
              <ReferenceLine
                y={85}
                stroke="#F87171"
                strokeDasharray="4 4"
                label={{
                  value: 'Risk Threshold (85%)',
                  fill: '#EF4444',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
              />

              {/* Other Berths lines */}
              {['B01', 'B02', 'B03', 'B05', 'B06'].map(bId => (
                <Line
                  key={bId}
                  type="monotone"
                  dataKey={bId}
                  name={bId}
                  stroke={berthColors[bId]}
                  strokeWidth={selectedBerth === bId ? 2.5 : 1.5}
                  strokeOpacity={selectedBerth === bId ? 1 : 0.35}
                  dot={{ r: selectedBerth === bId ? 3.5 : 2, fill: berthColors[bId] }}
                  activeDot={{ r: 5 }}
                />
              ))}

              {/* Highlighted B04 Bottleneck Line */}
              <Line
                type="monotone"
                dataKey="B04"
                name="B04 (High Risk)"
                stroke="#EF4444"
                strokeWidth={selectedBerth === 'B04' ? 3 : 2}
                dot={{ r: 4, fill: '#EF4444' }}
                activeDot={{ r: 6, fill: '#EF4444' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

