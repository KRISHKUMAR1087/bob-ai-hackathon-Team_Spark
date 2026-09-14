import React, { useEffect, useRef } from 'react';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError?: () => void;
  isLoading?: boolean;
}

let isGoogleInitialized = false;

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError, isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We only want to initialize once globally.
    const initializeGoogle = () => {
      if (!isGoogleInitialized && window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: (response: any) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else if (onError) {
              onError();
            }
          }
        });
        isGoogleInitialized = true;
      }
      
      if (containerRef.current && window.google) {
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
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
  }, []); // Empty dependency array as requested

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
