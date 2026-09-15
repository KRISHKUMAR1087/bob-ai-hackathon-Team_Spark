import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthErrorAlertProps {
  message: string | null;
  onDismiss?: () => void;
}

export const AuthErrorAlert: React.FC<AuthErrorAlertProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-medium shadow-sm leading-relaxed"
      >
        <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 pt-0.5">{message}</div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-200 transition-colors p-0.5 -mr-1 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 font-bold"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
