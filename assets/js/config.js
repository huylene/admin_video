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
const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyb3BsZ2llcm5lZ2hqcWR4Z2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwOTEyNDgsImV4cCI6MjEwNjY2NzI0OH0.FA5uQusQQJ_FWlkYm_7X9VtHOWFwUepsa3YqEt-KTBc';

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
