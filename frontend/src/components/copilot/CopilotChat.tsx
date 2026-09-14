import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Sparkles,
  ArrowRight,
  Zap,
  Terminal,
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';

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
  } = useOperations();
  const [inputQuery, setInputQuery] = useState('');
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

  const handleActionClick = (actionRoute?: string) => {
    if (actionRoute) {
      navigate(actionRoute);
      if (!embedded) {
        setIsCopilotOpen(false);
      }
    }
  };

  const quickChips = [
    'Why is B04 at risk?',
    'What happens if C03 fails?',
    'Why was Ocean Star moved?',
    'Which vessel should we prioritize?',
    'Compare alternate ports',
    'Generate tomorrow\'s shift plan',
    'What changed after the recovery plan?',
  ];

  return (
    <div className={`flex flex-col h-full bg-surface ${embedded ? 'rounded-card border border-border-subtle shadow-subtle' : ''}`}>
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
              className={`max-w-[85%] rounded-xl p-4 space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-slate-100 border border-slate-200 text-text-main font-medium'
                  : 'bg-surface border border-border-subtle text-text-main shadow-subtle'
              }`}
            >
              {/* Tool call indicator */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="space-y-1">
                  {msg.toolCalls.map((tc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-subtle border border-border-subtle text-[11px] text-text-muted"
                    >
                      <Terminal className="w-3 h-3 text-brand-teal shrink-0" />
                      <span className="font-mono font-medium text-text-main">{tc.toolName}()</span>
                      <span className="text-text-caption">→ {tc.resultSummary}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message text */}
              <div className="prose prose-xs max-w-none space-y-2 whitespace-pre-wrap font-sans text-xs text-text-main">
                {msg.text.split('\n\n').map((para, pIdx) => {
                  if (para.startsWith('### ')) {
                    return (
                      <h4 key={pIdx} className="text-xs font-bold text-text-main mt-2 mb-1">
                        {para.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (para.startsWith('> ')) {
                    return (
                      <div
                        key={pIdx}
                        className="p-2.5 rounded-md bg-surface-subtle border-l-2 border-brand-teal text-xs text-text-muted"
                      >
                        {para.replace('> ', '')}
                      </div>
                    );
                  }
                  return (
                    <p key={pIdx} className="leading-relaxed">
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Suggested Actions within Gemini reply */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="pt-2.5 border-t border-border-subtle flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => {
                        if (act.actionRoute) {
                          handleActionClick(act.actionRoute);
                        } else if (act.prompt) {
                          handleChipClick(act.prompt);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface hover:bg-surface-subtle text-text-main border border-border-subtle transition-colors shadow-subtle"
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
              <div className="w-7 h-7 rounded-lg bg-surface border border-border-subtle text-text-main flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold shadow-subtle">
                MV
              </div>
            )}
          </div>
        ))}

        {isCopilotLoading && (
          <div className="flex gap-3 text-xs justify-start">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-brand-teal flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-surface border border-border-subtle rounded-xl p-3 flex items-center gap-2 text-text-muted text-xs shadow-subtle">
              <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span>Querying telemetry and calculating recommendation...</span>
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
              className="px-2.5 py-1 rounded-md bg-surface hover:bg-slate-100 text-text-main border border-border-subtle text-xs transition-colors text-left shadow-subtle"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3.5 border-t border-border-subtle bg-surface">
        <div className="flex items-center gap-2 bg-surface-subtle border border-border-subtle rounded-lg px-3.5 py-2 focus-within:border-brand-teal transition-all">
          <input
            type="text"
            placeholder="Ask Copilot about vessel ETAs, berth B04, simulations..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={isCopilotLoading}
            className="flex-1 bg-transparent text-xs text-text-main placeholder-text-caption focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isCopilotLoading}
            className="p-1.5 rounded-md bg-brand-teal text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
