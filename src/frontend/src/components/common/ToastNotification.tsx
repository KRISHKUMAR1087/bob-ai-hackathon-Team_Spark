import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';

export const ToastNotification: React.FC = () => {
  const { toast, clearToast } = useOperations();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-brand-teal shrink-0" />;
    }
  };

  const getBorder = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-200';
      case 'warning':
        return 'border-amber-200';
      case 'error':
        return 'border-rose-200';
      default:
        return 'border-border-subtle';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`bg-surface border ${getBorder()} p-4 rounded-xl shadow-modal flex items-start gap-3`}
      >
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-text-main">{toast.title}</h4>
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={clearToast}
          className="text-text-caption hover:text-text-main transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
