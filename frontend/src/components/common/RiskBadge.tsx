import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface RiskBadgeProps {
  level?: string;
  risk?: string;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, risk, size = 'md' }) => {
  const actualLevel = level || risk || 'LOW';
  const normalized = actualLevel.toUpperCase();

  const config = {
    LOW: {
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: ShieldCheck,
      text: 'Low Risk',
    },
    NORMAL: {
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: ShieldCheck,
      text: 'Normal',
    },
    MEDIUM: {
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      text: 'Moderate Risk',
    },
    MODERATE: {
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      text: 'Moderate Risk',
    },
    HIGH: {
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertCircle,
      text: 'High Risk',
    },
    SEVERE: {
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertCircle,
      text: 'Severe Risk',
    },
    CRITICAL: {
      color: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold',
      icon: AlertCircle,
      text: 'Critical',
    },
  }[normalized] || {
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Info,
    text: level,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl font-medium border ${config.color} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {config.text}
    </span>
  );
};

