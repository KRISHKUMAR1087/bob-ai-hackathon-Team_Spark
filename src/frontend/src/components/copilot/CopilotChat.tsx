import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { CopilotMessageContent } from './CopilotMessageContent';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface CopilotChatProps {
  embedded?: boolean;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ embedded = false }) => {
  const navigate = useNavigate();
  const {
    copilotMessages,
    sendCopilotMessage,
    isCopilotLoading,
    setIsCopilotOpen,
    applyOptimization,
    applyRecoveryPlan,
  } = useOperations();

  const [inputQuery, setInputQuery] = useState('');
  const [pendingAction, setPendingAction] = useState<{
    type: 'optimization' | 'recovery';
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages, isCopilotLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isCopilotLoading) return;
    const q = inputQuery;
    setInputQuery('');
    await sendCopilotMessage(q);
  };

  const handleChipClick = async (prompt: string) => {
    if (isCopilotLoading) return;
    await sendCopilotMessage(prompt);
  };

  const handleActionClick = (action: { label: string; actionRoute?: string; prompt?: string; requiresConfirmation?: boolean }) => {
    if (action.prompt) {
      handleChipClick(action.prompt);
      return;
    }

    const lowerLabel = action.label.toLowerCase();

    // Check if action changes state directly
    if (lowerLabel.includes('apply optimization')) {
      setPendingAction({
        type: 'optimization',
        title: 'Apply Berth Optimization',
        description: 'Are you sure you want to execute the OR-Tools optimization plan to reassign Ocean Star to Berth B02?',
        action: () => {
          applyOptimization();
          setPendingAction(null);
        },
      });
      return;
    }

    if (lowerLabel.includes('apply recovery')) {
      setPendingAction({
        type: 'recovery',
        title: 'Apply AI Recovery Plan',
        description: 'Are you sure you want to execute the recovery plan (redeploy C05 to B04 and divert Ocean Star to B02)?',
        action: () => {
          applyRecoveryPlan();
          setPendingAction(null);
        },
      });
      return;
    }

    if (action.actionRoute) {
      navigate(action.actionRoute);
      if (!embedded) {
        setIsCopilotOpen(false);
      }
    }
  };

  const quickChips = [
    'Why is B04 at risk?',
    'What happens if C03 fails?',
    'Why did the optimizer move Ocean Star?',
    'What changed after the recovery plan?',
    'Which berth needs attention?',
    'Summarize the next 24 hours.',
  ];

  return (
    <div className={`flex flex-col h-full bg-surface ${embedded ? 'rounded-3xl border border-border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : ''}`}>
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {copilotMessages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'gemini' && (
              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-brand-teal flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[90%] rounded-xl p-4 space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-slate-100 border border-slate-200 text-text-main font-medium'
                  : 'bg-surface border border-border-subtle text-text-main shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
              }`}
            >
              {/* Message content with clean Markdown, Tables & Charts */}
              <CopilotMessageContent message={msg} />

              {/* Suggested Actions within Gemini reply */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="pt-2 border-t border-border-subtle flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleActionClick(act)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-surface hover:bg-surface-subtle text-text-main border border-border-subtle transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-brand-teal" />
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3 text-text-caption ml-0.5" />
                    </button>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-text-caption text-right">
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-surface border border-border-subtle text-text-main flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                OP
              </div>
            )}
          </div>
        ))}

        {isCopilotLoading && (
          <div className="flex gap-3 text-xs justify-start">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-brand-teal flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-3 flex items-center gap-2 text-text-muted text-xs shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span>Analyzing port operations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="p-3.5 border-t border-border-subtle bg-surface-subtle/50">
        <div className="text-xs text-text-muted mb-2 font-medium">
          Suggested Inquiries:
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              disabled={isCopilotLoading}
              className="px-2.5 py-1 rounded-xl bg-surface hover:bg-slate-100 text-text-main border border-border-subtle text-xs transition-colors text-left shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-3.5 border-t border-border-subtle bg-surface">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Ask about berths, queues, optimizer, or disruption simulation..."
            disabled={isCopilotLoading}
            className="flex-1 bg-surface-subtle border border-border-subtle rounded-lg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-caption focus:outline-hidden focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isCopilotLoading || !inputQuery.trim()}
            className="px-4 py-2.5 bg-brand-teal hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Confirmation Modal for State-Changing Operations */}
      <ConfirmationModal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={() => pendingAction?.action()}
        title={pendingAction?.title || 'Confirm Operational Action'}
        description={pendingAction?.description || ''}
        confirmLabel="Execute Change"
        cancelLabel="Cancel"
        type="warning"
      />
    </div>
  );
};

