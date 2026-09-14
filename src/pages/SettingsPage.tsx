import React, { useState } from 'react';
import { Save, ShieldCheck, Cpu, Sliders, User } from 'lucide-react';
import { useOperations } from '../context/OperationsContext';

export const SettingsPage: React.FC = () => {
  const { showToast } = useOperations();
  const [activeTab, setActiveTab] = useState<'profile' | 'port' | 'ml' | 'ai'>('port');

  const [portName, setPortName] = useState('Port of Euro-Transshipment Gateway');
  const [berthCount, setBerthCount] = useState(6);
  const [warningThreshold, setWarningThreshold] = useState(85);
  const [lookaheadHorizon, setLookaheadHorizon] = useState('72h');
  const [aiAutonomy, setAiAutonomy] = useState('recommend_only');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-pro');

  const handleSave = () => {
    showToast('success', 'Settings Saved', 'Operational parameters updated across all telemetry services.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Port Configuration & Model Settings
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Configure berth capacity limits, ML saturation thresholds, and Gemini operational copilot guardrails.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-subtle"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-3">
        {[
          { id: 'port', label: 'Port Configuration', icon: Sliders },
          { id: 'ml', label: 'Prediction Thresholds', icon: Cpu },
          { id: 'ai', label: 'Copilot Settings', icon: ShieldCheck },
          { id: 'profile', label: 'Supervisor Profile', icon: User },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors border ${
                activeTab === tab.id
                  ? 'bg-surface text-text-main font-semibold border-slate-300 shadow-subtle'
                  : 'bg-surface-subtle text-text-muted hover:text-text-main border-border-subtle'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-surface rounded-card border border-border-subtle shadow-subtle p-6 space-y-6 text-xs">
        {activeTab === 'port' && (
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="text-text-muted block mb-1.5 font-medium">Terminal Port Name</label>
              <input
                type="text"
                value={portName}
                onChange={e => setPortName(e.target.value)}
                className="w-full bg-surface-subtle border border-border-subtle rounded-md px-3 py-2 text-text-main focus:outline-hidden focus:border-brand-teal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-muted block mb-1.5 font-medium">Active Commercial Quays</label>
                <input
                  type="number"
                  value={berthCount}
                  onChange={e => setBerthCount(Number(e.target.value))}
                  className="w-full bg-surface-subtle border border-border-subtle rounded-md px-3 py-2 text-text-main focus:outline-hidden focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="text-text-muted block mb-1.5 font-medium">Total STS Cranes Fleet</label>
                <input
                  type="number"
                  disabled
                  value={8}
                  className="w-full bg-slate-100 border border-border-subtle rounded-md px-3 py-2 text-text-caption cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-text-muted block mb-1.5 font-medium">Daily Shift Windows</label>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-surface-subtle rounded-md border border-border-subtle text-text-main">
                  Shift 1: 06:00 – 14:00
                </div>
                <div className="p-2.5 bg-surface-subtle rounded-md border border-border-subtle text-text-main">
                  Shift 2: 14:00 – 22:00
                </div>
                <div className="p-2.5 bg-surface-subtle rounded-md border border-border-subtle text-text-main">
                  Shift 3: 22:00 – 06:00
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ml' && (
          <div className="space-y-4 max-w-xl">
            <div>
              <div className="flex justify-between text-text-muted mb-1 font-medium">
                <span>Critical Berth Congestion Alert Trigger:</span>
                <span className="text-rose-600 font-bold">{warningThreshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={warningThreshold}
                onChange={e => setWarningThreshold(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="text-[11px] text-text-caption mt-1">
                Berths exceeding this threshold in the 24h horizon generate automatic high-severity bottleneck warnings.
              </div>
            </div>

            <div>
              <label className="text-text-muted block mb-1.5 font-medium">Default Lookahead Horizon</label>
              <select
                value={lookaheadHorizon}
                onChange={e => setLookaheadHorizon(e.target.value)}
                className="w-full bg-surface-subtle border border-border-subtle rounded-md px-3 py-2 text-text-main focus:outline-hidden focus:border-brand-teal"
              >
                <option value="24h">24 Hours (Operational Shift)</option>
                <option value="48h">48 Hours (Tidal Cycle)</option>
                <option value="72h">72 Hours (Strategic Default)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="text-text-muted block mb-1.5 font-medium">AI Autonomy Level</label>
              <select
                value={aiAutonomy}
                onChange={e => setAiAutonomy(e.target.value)}
                className="w-full bg-surface-subtle border border-border-subtle rounded-md px-3 py-2 text-text-main focus:outline-hidden focus:border-brand-teal"
              >
                <option value="recommend_only">Human-in-the-Loop (Supervisor must approve every plan)</option>
                <option value="assisted">Assisted Automation (Auto-draft with timeout window)</option>
              </select>
            </div>

            <div>
              <label className="text-text-muted block mb-1.5 font-medium">Gemini Reasoning Engine</label>
              <select
                value={geminiModel}
                onChange={e => setGeminiModel(e.target.value)}
                className="w-full bg-surface-subtle border border-border-subtle rounded-md px-3 py-2 text-text-main focus:outline-hidden focus:border-brand-teal"
              >
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Maritime Reasoning & Multi-tool)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Low-latency)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-subtle border border-border-subtle flex items-center justify-center text-text-main text-base font-semibold">
                MV
              </div>
              <div>
                <div className="text-sm font-semibold text-text-main">Capt. M. Vance</div>
                <div className="text-text-muted text-xs">Port Operations Superintendent</div>
              </div>
            </div>

            <div>
              <label className="text-text-muted block mb-1.5 font-medium">Operations Console Email</label>
              <input
                type="email"
                disabled
                value="m.vance@portpulse.maritime.gov"
                className="w-full bg-slate-100 border border-border-subtle rounded-md px-3 py-2 text-text-caption cursor-not-allowed"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
