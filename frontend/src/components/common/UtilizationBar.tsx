import React from 'react';

interface UtilizationBarProps {
  percentage: number;
  threshold?: number;
  height?: string;
  showLabel?: boolean;
  animate?: boolean;
}

export const UtilizationBar: React.FC<UtilizationBarProps> = ({
  percentage,
  threshold = 85,
  height = 'h-2',
  showLabel = false,
  animate = true,
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));

  const getColor = () => {
    if (clamped >= threshold) return 'bg-op-red';
    if (clamped >= 70) return 'bg-op-amber';
    return 'bg-brand-teal';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-text-muted">{clamped}% Utilization</span>
          {threshold && (
            <span className="text-[11px] text-text-caption">Threshold: {threshold}%</span>
          )}
        </div>
      )}
      <div className={`relative w-full bg-slate-100 rounded-full overflow-hidden border border-border-subtle ${height}`}>
        {/* Fill bar */}
        <div
          className={`${height} ${getColor()} rounded-full ${
            animate ? 'transition-all duration-500 ease-out' : ''
          }`}
          style={{ width: `${clamped}%` }}
        />
        {/* Threshold line indicator */}
        {threshold && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
            style={{ left: `${threshold}%` }}
            title={`Threshold: ${threshold}%`}
          />
        )}
      </div>
    </div>
  );
};
