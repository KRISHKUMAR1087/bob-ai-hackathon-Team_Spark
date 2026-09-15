<<<<<<< HEAD
import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}
=======
import React, { useState } from 'react';
import { AuthService } from '../../services/authService';
>>>>>>> edd8ccee175e778cf1874174be88f9a68d842889

interface GoogleSignInButtonProps {
  onSuccess?: (idToken: string) => void;
  onError?: (err?: any) => void;
  isLoading?: boolean;
}

<<<<<<< HEAD
let initializedClientId: string | null = null;

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError, isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const [buttonWidth, setButtonWidth] = useState(360);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (!containerRef.current) return;
      const nextWidth = Math.floor(containerRef.current.getBoundingClientRect().width);
      if (nextWidth > 0) {
        setButtonWidth(Math.min(nextWidth, 400));
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    const initializeGoogle = () => {
      if (!clientId) {
        console.error('VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In cannot be initialized.');
        onErrorRef.current?.();
        return;
      }

      if (initializedClientId !== clientId && window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              onSuccessRef.current(response.credential);
            } else {
              onErrorRef.current?.();
            }
          }
        });
        initializedClientId = clientId;
      }
      
      if (containerRef.current && window.google) {
        containerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: buttonWidth,
          text: 'continue_with'
        });
      }
    };

    if (typeof window !== 'undefined') {
      if (window.google) {
        initializeGoogle();
      } else {
        // Load the script if not already present
        const existingScript = document.getElementById('google-gsi-client');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.id = 'google-gsi-client';
          script.async = true;
          script.defer = true;
          script.onload = initializeGoogle;
          document.head.appendChild(script);
        } else {
          existingScript.addEventListener('load', initializeGoogle);
        }
      }
    }
  }, [buttonWidth]);

  if (isLoading) {
    return (
      <button disabled className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-text-main bg-surface border border-border-subtle flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      </button>
    );
  }
=======
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onError,
  isLoading: externalLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading || internalLoading;

  const handleClick = async () => {
    try {
      setInternalLoading(true);
      await AuthService.signInWithGoogle();
    } catch (err: any) {
      console.error('Google OAuth launch error:', err);
      setInternalLoading(false);
      if (onError) onError(err);
    }
  };
>>>>>>> edd8ccee175e778cf1874174be88f9a68d842889

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-slate-300 transition-all flex items-center justify-center gap-3 shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
    </button>
  );
};

