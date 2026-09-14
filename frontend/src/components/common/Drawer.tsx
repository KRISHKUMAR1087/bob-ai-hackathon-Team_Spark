import React from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-xl',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div
          className={`w-screen ${width} max-w-full bg-surface border-l border-border-subtle shadow-modal flex flex-col animate-in slide-in-from-right duration-300`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between bg-surface-subtle/50">
            <div>
              <h2 className="text-base font-semibold text-text-main">{title}</h2>
              {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-text-caption hover:text-text-main hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
