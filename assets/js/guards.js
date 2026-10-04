/**
 * Route Guards & Authorization Checks
 */

window.guards = {
  // Requires user to be logged in
  async requireAuth() {
    // If Supabase not yet configured, allow viewing in demo/setup mode with banner
    if (!window.APP_CONFIG.isConfigured()) {
      return { id: 'demo', username: 'Demo User', role: 'ADMIN', email: 'demo@example.com' };
    }

    const session = await window.auth.getCurrentSession();
    if (!session) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `login.html?returnUrl=${returnUrl}`;
      return null;
    }

    const profile = await window.auth.getCurrentProfile();
    return profile;
  },

  // Requires user to have ADMIN role
  async requireAdmin() {
    const profile = await this.requireAuth();
    if (!profile) return null;

    if (profile.role !== 'ADMIN') {
      window.UI.showToast('Bạn không có quyền truy cập trang này (Yêu cầu ADMIN).', 'error', 'Từ chối quyền truy cập');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
      return null;
    }

    return profile;
  },

  // Redirect to dashboard if user is already logged in
  async redirectIfAuthenticated() {
    if (!window.APP_CONFIG.isConfigured()) return;

    const session = await window.auth.getCurrentSession();
    if (session) {
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');
      if (returnUrl) {
        window.location.href = decodeURIComponent(returnUrl);
      } else {
        window.location.href = 'dashboard.html';
      }
    }
  }
};
