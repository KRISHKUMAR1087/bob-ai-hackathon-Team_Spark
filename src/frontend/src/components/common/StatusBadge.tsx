import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStyle = () => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'LOADING':
      case 'BERTHING':
      case 'AVAILABLE':
      case 'OPTIMIZED':
      case 'SCHEDULED':
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/90';
      case 'ARRIVING':
      case 'OCCUPIED':
      case 'IDLE':
      case 'INFO':
        return 'bg-sky-50 text-sky-800 border-sky-200/90';
      case 'AT ANCHOR':
      case 'DELAYED':
      case 'MAINTENANCE':
      case 'WARNING':
      case 'MEDIUM':
      case 'MODERATE':
        return 'bg-amber-50 text-amber-800 border-amber-200/90';
      case 'FAILED':
      case 'CONGESTED':
      case 'CRITICAL':
      case 'CONFLICT':
      case 'HIGH':
      case 'SEVERE':
        return 'bg-rose-50 text-rose-700 border-rose-200/90 font-semibold';
      case 'COMPLETED':
      case 'STANDARD':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-xl text-[11px] font-medium border ${getStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0 opacity-70" />
      {status}
    </span>
  );
};

