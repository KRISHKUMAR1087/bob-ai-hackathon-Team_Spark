import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError?: () => void;
  isLoading?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError, isLoading }) => {
  if (isLoading) {
    return (
      <button disabled className="w-full py-2.5 px-4 rounded-md text-xs font-medium text-text-main bg-surface border border-border-subtle flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      </button>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            onSuccess(credentialResponse.credential);
          }
        }}
        onError={() => {
          console.error('Google Login Failed');
          if (onError) onError();
        }}
        useOneTap
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
      />
    </div>
  );
};
