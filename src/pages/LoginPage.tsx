import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, ArrowRight, ShieldCheck, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('supervisor@portpulse.ai');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const handleDemoSignIn = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 relative">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-teal text-white shadow-subtle mb-2">
            <Ship className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">
            PortPulse <span className="text-brand-teal">AI</span>
          </h1>
          <p className="text-xs text-text-muted">
            Port Operations Intelligence • Decision Support Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-border-subtle rounded-card shadow-subtle p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <span className="text-xs font-semibold text-text-main uppercase tracking-wider">
              Operator Sign In
            </span>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>AIS Live</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-text-muted block mb-1.5 font-medium">Operator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-caption absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-surface-subtle border border-border-subtle rounded-md pl-9 pr-3 py-2 text-text-main focus:outline-hidden focus:border-brand-teal"
                  placeholder="supervisor@portpulse.ai"
                />
              </div>
            </div>

            <div>
              <label className="text-text-muted block mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-caption absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface-subtle border border-border-subtle rounded-md pl-9 pr-3 py-2 text-text-main focus:outline-hidden focus:border-brand-teal"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-md text-xs font-semibold text-white bg-brand-teal hover:bg-teal-700 transition-all shadow-subtle flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="pt-3 border-t border-border-subtle space-y-2">
            <div className="text-[11px] text-text-caption text-center">
              Demo Operations Environment
            </div>
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2 rounded-md text-xs font-medium text-text-main hover:bg-surface-subtle bg-surface border border-border-subtle transition-colors flex items-center justify-center gap-2 shadow-subtle"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Enter as Operations Supervisor</span>
            </button>
          </div>
        </div>

        {/* Footer Tagline */}
        <p className="text-center text-xs text-text-muted">
          “Predict the bottleneck before the world feels it.”
        </p>
      </div>
    </div>
  );
};
