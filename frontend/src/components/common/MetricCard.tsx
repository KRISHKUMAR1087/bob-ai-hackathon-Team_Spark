import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: LucideIcon;
  variant?: 'default' | 'cyan' | 'amber' | 'red';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  trend,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const getHighlight = () => {
    switch (variant) {
      case 'amber':
        return 'text-amber-700';
      case 'red':
        return 'text-rose-600 font-semibold';
      case 'cyan':
        return 'text-teal-700';
      default:
        return 'text-text-main';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-3xl p-4 sm:p-5 border border-border-subtle shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all min-w-0 ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
        <span className="text-xs font-medium text-text-muted truncate">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-text-caption shrink-0" />}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold tracking-tight ${getHighlight()}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-text-caption">{unit}</span>}
      </div>

      {(trend || subtext) && (
        <div className="mt-2 flex items-center justify-between text-xs">
          {subtext && <span className="text-text-muted text-[11px] truncate">{subtext}</span>}
          {trend && (
            <span
              className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                trend.isNeutral
                  ? 'text-slate-600 bg-slate-100'
                  : trend.isPositive
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-rose-700 bg-rose-50'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
