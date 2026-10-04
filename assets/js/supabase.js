/**
 * Initialize Supabase Client (v2)
 */

(function () {
  if (typeof supabase === 'undefined') {
    console.error('Supabase JS library not loaded. Ensure CDN script is included.');
    return;
  }

  try {
    const { createClient } = supabase;
    window.sb = createClient(
      window.APP_CONFIG.supabaseUrl,
      window.APP_CONFIG.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
})();
