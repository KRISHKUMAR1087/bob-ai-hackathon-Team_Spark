import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError?: () => void;
  isLoading?: boolean;
}

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

  return (
    <div className="w-full flex justify-center" ref={containerRef}></div>
  );
};
