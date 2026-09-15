import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'warning' | 'info' | 'success';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  type = 'info',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface border border-border-subtle rounded-xl shadow-modal p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-caption hover:text-text-main transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              type === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-teal-50 text-teal-800 border border-teal-200'
            }`}
          >
            {type === 'warning' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-main">{title}</h3>
            <p className="mt-1.5 text-sm text-text-muted leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-text-muted hover:text-text-main bg-surface-subtle hover:bg-slate-200 rounded-xl border border-border-subtle transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 rounded-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

