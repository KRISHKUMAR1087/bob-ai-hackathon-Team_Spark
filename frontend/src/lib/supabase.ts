import { createClient } from '@supabase/supabase-js';

// Fallback Supabase configuration for PortsPilot AI
// Primary project ID: osgteroqqxmnpqwvcrhc
const defaultSupabaseUrl = 'https://osgteroqqxmnpqwvcrhc.supabase.co';
const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy-anon-key';

// If a token is in the hash, extract the issuer URL dynamically to guarantee 100% match
const getDynamicSupabaseUrl = (): string => {
  if (import.meta.env.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }
  try {
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token=')) {
      const cleanHash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
      const params = new URLSearchParams(cleanHash);
      const token = params.get('access_token');
      if (token) {
        const base64Url = token.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
          if (payload.iss && typeof payload.iss === 'string') {
            return payload.iss.replace(/\/auth\/v1\/?$/, '');
          }
        }
      }
    }
  } catch {
    // Fallback to default project URL
  }
  return defaultSupabaseUrl;
};

const supabaseUrl = getDynamicSupabaseUrl();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey;

if (!import.meta.env.VITE_SUPABASE_URL && import.meta.env.DEV) {
  console.info(`[Supabase] Using PortsPilot project endpoint: ${supabaseUrl}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

