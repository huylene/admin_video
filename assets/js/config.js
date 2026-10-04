/**
 * Supabase Project Configuration
 * 
 * Thay thế giá trị bên dưới bằng Project URL và Publishable/Anon Key từ Supabase Dashboard:
 * Project Settings > API > Project URL & anon/public key.
 * 
 * Hoặc bạn có thể thiết lập qua localStorage:
 * localStorage.setItem('SUPABASE_URL', 'https://your-project.supabase.co');
 * localStorage.setItem('SUPABASE_ANON_KEY', 'your-anon-key');
 */

const defaultUrl = 'https://droplgierneghjqdxgcx.supabase.co';
const defaultAnonKey = 'YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY';

window.APP_CONFIG = {
  supabaseUrl: localStorage.getItem('SUPABASE_URL') || defaultUrl,
  supabaseAnonKey: localStorage.getItem('SUPABASE_ANON_KEY') || defaultAnonKey,
  isConfigured() {
    return this.supabaseUrl && 
           this.supabaseAnonKey && 
           !this.supabaseUrl.includes('YOUR_SUPABASE_PROJECT_ID') &&
           !this.supabaseAnonKey.includes('YOUR_SUPABASE_ANON');
  },
  saveCredentials(url, key) {
    if (url) localStorage.setItem('SUPABASE_URL', url.trim());
    if (key) localStorage.setItem('SUPABASE_ANON_KEY', key.trim());
    window.location.reload();
  },
  clearCredentials() {
    localStorage.removeItem('SUPABASE_URL');
    localStorage.removeItem('SUPABASE_ANON_KEY');
    window.location.reload();
  }
};
