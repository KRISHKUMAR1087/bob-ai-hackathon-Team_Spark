import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { RoleSelector } from '../components/auth/RoleSelector';
import { UserRole } from '../types/auth';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { confirmRoleSelection } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // Exchange session or read existing session from URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session || !session.user) {
          // Wait briefly for onAuthStateChange in case session is being processed
          const { data: authListener } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, newSession: Session | null) => {
            if (newSession?.user && isMounted) {
              authListener.subscription.unsubscribe();
              await checkUserRole(newSession.user);
            }
          });

          // Timeout fallback
          setTimeout(() => {
            if (isMounted && loading) {
              setError('Failed to establish authentication session. Please try logging in again.');
              setLoading(false);
            }
          }, 4000);
          return;
        }

        await checkUserRole(session.user);
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        if (isMounted) {
          setError(err.message || 'Authentication failed during callback.');
          setLoading(false);
        }
      }
    };

    const checkUserRole = async (user: SupabaseUser) => {
      const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      setUserName(name);

      // Check if user already has an assigned role
      let role = user.user_metadata?.role as UserRole | undefined;

      // Also check profiles table
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role) {
          role = profile.role as UserRole;
        }
      } catch (e) {
        console.warn('Profiles check in callback skipped', e);
      }

      if (role && (role === 'admin' || role === 'ship-agent')) {
        // User already has a role assigned -> redirect to their portal
        const target = role === 'admin' ? '/dashboard' : '/shipping/dashboard';
        navigate(target, { replace: true });
      } else {
        // New Google user without assigned role -> present role selection
        setLoading(false);
        setShowRoleSelector(true);
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleRoleSelected = async (role: UserRole) => {
    try {
      setLoading(true);
      setShowRoleSelector(false);
      const updatedUser = await confirmRoleSelection(role);
      const target = updatedUser.role === 'admin' ? '/dashboard' : '/shipping/dashboard';
      navigate(target, { replace: true });
    } catch (err: any) {
      console.error('Role assignment error:', err);
      setError(err.message || 'Failed to set operational role.');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-border-subtle rounded-2xl p-6 shadow-modal text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-text-main">Authentication Issue</h2>
          <p className="text-xs text-text-muted">{error}</p>
          <button
            onClick={() => navigate('/auth/login', { replace: true })}
            className="w-full py-2.5 rounded-xl bg-brand-teal text-white font-semibold text-xs hover:bg-teal-600 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (showRoleSelector) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <RoleSelector onSelectRole={handleRoleSelected} userName={userName} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-xs text-text-muted">
        <div className="w-5 h-5 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
        <span>Completing secure authentication...</span>
      </div>
    </div>
  );
};
