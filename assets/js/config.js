// Environment configuration
// Vite exposes environment variables prefixed with VITE_ through import.meta.env

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  },
};

// Export for inline script compatibility (non-module scripts)
if (typeof window !== "undefined") {
  window.DOGBAR_CONFIG = config;
}
