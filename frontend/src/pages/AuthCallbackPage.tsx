import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { RoleSelector } from '../components/auth/RoleSelector';
import { UserRole } from '../types/auth';
import { AuthService } from '../services/authService';
import { AuthErrorAlert } from '../components/auth/AuthErrorAlert';
import { Ship } from 'lucide-react';

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
        // Read pre-selected role if user selected role BEFORE Google auth
        const pendingRole = localStorage.getItem('pending_google_role') as UserRole | null;

        // Helper function to auto-assign pending role and redirect
        const applyPendingRoleAndRedirect = async () => {
          if (pendingRole && (pendingRole === 'admin' || pendingRole === 'ship-agent')) {
            localStorage.removeItem('pending_google_role');
            const confirmedUser = await confirmRoleSelection(pendingRole);
            const target = confirmedUser.role === 'admin' ? '/dashboard' : '/shipping/dashboard';
            navigate(target, { replace: true });
            return true;
          }
          return false;
        };

        // 1. Process OAuth hash if present
        const oAuthUser = await AuthService.handleOAuthHashSession();
        if (oAuthUser && isMounted) {
          const applied = await applyPendingRoleAndRedirect();
          if (!applied) {
            await checkUserRole(oAuthUser);
          }
          return;
        }

        // 2. Exchange session or read existing session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user && isMounted) {
          const applied = await applyPendingRoleAndRedirect();
          if (!applied) {
            await checkUserRole(session.user);
          }
          return;
        }

        // 3. Fallback: check stored user
        const storedUser = AuthService.getStoredUser();
        if (storedUser && isMounted) {
          const applied = await applyPendingRoleAndRedirect();
          if (!applied) {
            await checkUserRole(storedUser);
          }
          return;
        }

        // 4. Wait briefly for onAuthStateChange in case session is being processed
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          if (newSession?.user && isMounted) {
            authListener.subscription.unsubscribe();
            const applied = await applyPendingRoleAndRedirect();
            if (!applied) {
              await checkUserRole(newSession.user);
            }
          }
        });

        // Timeout fallback
        setTimeout(() => {
          if (isMounted && loading) {
            setError('Failed to establish authentication session. Please try logging in again.');
            setLoading(false);
          }
        }, 4000);
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        if (isMounted) {
          setError(err.message || 'Authentication failed during callback.');
          setLoading(false);
        }
      }
    };

    const checkUserRole = async (userObj: any) => {
      const name =
        userObj.user_metadata?.name ||
        userObj.user_metadata?.full_name ||
        userObj.name ||
        userObj.email?.split('@')[0] ||
        '';
      setUserName(name);

      // Check if user already has an assigned role
      let role = (userObj.user_metadata?.role || userObj.role) as UserRole | undefined;

      // Also check profiles table if user ID exists
      if (userObj.id && !role) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userObj.id)
            .maybeSingle();

          if (profile?.role) {
            role = profile.role as UserRole;
          }
        } catch (e) {
          console.warn('Profiles check in callback skipped', e);
        }
      }

      if (role && (role === 'admin' || role === 'ship-agent')) {
        // User already has a role assigned -> redirect to their portal
        const target = role === 'admin' ? '/dashboard' : '/shipping/dashboard';
        navigate(target, { replace: true });
      } else {
        // Fallback: prompt role selection if no role was pre-selected or assigned
        setLoading(false);
        setShowRoleSelector(true);
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, confirmRoleSelection, loading]);

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
        <div className="max-w-md w-full bg-surface border border-border-subtle rounded-2xl p-6 shadow-modal space-y-4">
          <div className="flex items-center gap-3 justify-center mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-teal flex items-center justify-center text-white">
              <Ship className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-main">PortsPilot</span>
          </div>
          <AuthErrorAlert message={error} onDismiss={() => setError(null)} />
          <button
            onClick={() => navigate('/auth/login', { replace: true })}
            className="w-full py-2.5 rounded-xl bg-brand-teal text-white font-semibold text-xs hover:bg-teal-600 transition shadow-sm cursor-pointer"
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
        <div className="w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
        <span className="font-medium">Completing secure Google authentication...</span>
      </div>
    </div>
  );
};
