import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ship, Anchor, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { RoleSelector } from '../components/auth/RoleSelector';
import { MusicButton } from '../components/common/MusicButton';
import { User, UserRole } from '../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsDemo, loginWithGoogle, confirmRoleSelection } = useAuth();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Return to intended page or role home
  const getRedirectPath = (role: UserRole) => {
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/login') {
      // Check if target is permitted for role
      if (role === 'admin' && !from.startsWith('/shipping')) return from;
      if (role === 'ship-agent' && from.startsWith('/shipping')) return from;
    }
    return role === 'admin' ? '/dashboard' : '/shipping/dashboard';
  };

  const handleDemoLogin = (role: UserRole) => {
    const user = loginAsDemo(role);
    navigate(getRedirectPath(user.role), { replace: true });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.needsRoleSelection && result.tempUser) {
        setPendingGoogleUser(result.tempUser);
        setShowRoleSelector(true);
      } else {
        // Logged in with existing role
        const storedRole = localStorage.getItem('portpulse_user_role') as UserRole || 'admin';
        navigate(getRedirectPath(storedRole), { replace: true });
      }
    } catch (e) {
      console.error('Google sign in error:', e);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRoleSelected = (role: UserRole) => {
    const confirmed = confirmRoleSelection(role, pendingGoogleUser);
    setShowRoleSelector(false);
    navigate(getRedirectPath(confirmed.role), { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Top-right Music button for login screen */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center gap-2">
        <span className="hidden sm:inline text-[11px] text-text-muted">Ambient Sound</span>
        <MusicButton />
      </div>
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-teal text-white shadow-subtle mb-1">
            <Ship className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main">
            PortPulse <span className="text-brand-teal">AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto">
            “Predict the bottleneck before the world feels it.”
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-surface border border-border-subtle rounded-card shadow-subtle p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3.5">
            <div>
              <span className="text-xs font-semibold text-text-main uppercase tracking-wider block">
                Choose your workspace
              </span>
              <span className="text-[11px] text-text-muted">
                1-click access to maritime operational portals
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px]">Demo Ready</span>
            </div>
          </div>

          {/* Role Selection Options */}
          <div className="space-y-3.5">
            {/* Option A: Port Admin */}
            <div
              onClick={() => handleDemoLogin('admin')}
              className="p-4 rounded-lg border border-border-subtle hover:border-brand-teal hover:bg-teal-50/20 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-subtle"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center shrink-0 group-hover:bg-brand-teal group-hover:text-white transition-colors">
                  <Ship className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-text-main group-hover:text-brand-teal transition-colors">
                    Continue as Port Admin
                  </div>
                  <div className="text-[11px] text-text-muted truncate">
                    Port Operations & Control • Berths, Cranes, Disruption Simulator
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-brand-teal group-hover:bg-teal-700 transition-colors shadow-subtle flex items-center gap-1"
              >
                <span className="hidden sm:inline">Enter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Option B: Ship Agent */}
            <div
              onClick={() => handleDemoLogin('ship-agent')}
              className="p-4 rounded-lg border border-border-subtle hover:border-sky-500 hover:bg-sky-50/20 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-subtle"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Anchor className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-text-main group-hover:text-sky-700 transition-colors">
                    Continue as Ship Agent
                  </div>
                  <div className="text-[11px] text-text-muted truncate">
                    Shipping & Vessel Operations • Turnaround Tracking & Alerts
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-sky-600 group-hover:bg-sky-700 transition-colors shadow-subtle flex items-center gap-1"
              >
                <span className="hidden sm:inline">Enter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border-subtle"></div>
            <span className="flex-shrink mx-4 text-[11px] uppercase tracking-wider text-text-caption font-medium">
              or
            </span>
            <div className="flex-grow border-t border-border-subtle"></div>
          </div>

          {/* Google Sign-In */}
          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
          />
        </div>

        {/* Security & Hackathon Demo Tag */}
        <div className="text-center text-xs text-text-caption space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-text-muted">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            <span>PortPulse AI Competition Demo • Role-Based Access Control</span>
          </div>
          <p className="text-[11px]">
            No credentials required. Session persists in your browser until logged out.
          </p>
        </div>
      </div>

      {/* Role Selection Modal for Google Sign-in */}
      {showRoleSelector && (
        <RoleSelector
          onSelectRole={handleRoleSelected}
          userName={pendingGoogleUser?.name}
        />
      )}
    </div>
  );
};
