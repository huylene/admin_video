/**
 * UI Utilities, Formatters, Toast, Modal & Layout Renderer
 */

window.UI = {
  // Toast notifications
  toastContainer: null,

  showToast(message, type = 'info', title = '') {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    } else {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
      <div style="flex-shrink: 0; padding-top: 2px;">${iconSvg}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // Modal Confirm Dialog
  showConfirmModal({ title = 'Xác nhận', message = 'Bạn có chắc chắn muốn thực hiện hành động này?', confirmText = 'Xác nhận', cancelText = 'Hủy', isDanger = false, onConfirm }) {
    let backdrop = document.getElementById('global-confirm-modal');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'global-confirm-modal';
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }

    backdrop.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="btn btn-ghost btn-sm close-modal-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--text-muted); font-size: var(--font-size-sm);">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary cancel-btn">${cancelText}</button>
          <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'} confirm-btn">${confirmText}</button>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    const closeModal = () => {
      backdrop.classList.remove('active');
    };

    backdrop.querySelector('.close-modal-btn').onclick = closeModal;
    backdrop.querySelector('.cancel-btn').onclick = closeModal;
    backdrop.querySelector('.confirm-btn').onclick = async () => {
      closeModal();
      if (typeof onConfirm === 'function') {
        await onConfirm();
      }
    };
  },

  // Modal Supabase Quick Config
  showConfigModal() {
    let backdrop = document.getElementById('config-modal');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'config-modal';
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }

    backdrop.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Cấu hình kết nối Supabase</h3>
          <button class="btn btn-ghost btn-sm close-modal-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--text-muted); font-size: var(--font-size-xs); margin-bottom: var(--space-4);">
            Lấy thông tin từ Supabase Dashboard: <strong>Project Settings &gt; API</strong>.
          </p>
          <div class="form-group">
            <label class="form-label required">Supabase Project URL</label>
            <input type="url" id="cfg-url" class="form-input" placeholder="https://xyzcompany.supabase.co" value="${window.APP_CONFIG.supabaseUrl.includes('YOUR_SUPABASE') ? '' : window.APP_CONFIG.supabaseUrl}">
          </div>
          <div class="form-group">
            <label class="form-label required">Supabase Anon / Public Key</label>
            <textarea id="cfg-key" class="form-textarea" style="min-height: 80px;" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">${window.APP_CONFIG.supabaseAnonKey.includes('YOUR_SUPABASE') ? '' : window.APP_CONFIG.supabaseAnonKey}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary cancel-btn">Đóng</button>
          <button class="btn btn-primary save-cfg-btn">Lưu cấu hình</button>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    const closeModal = () => backdrop.classList.remove('active');
    backdrop.querySelector('.close-modal-btn').onclick = closeModal;
    backdrop.querySelector('.cancel-btn').onclick = closeModal;
    backdrop.querySelector('.save-cfg-btn').onclick = () => {
      const url = document.getElementById('cfg-url').value.trim();
      const key = document.getElementById('cfg-key').value.trim();
      if (!url || !key) {
        alert('Vui lòng nhập đầy đủ URL và Anon Key!');
        return;
      }
      window.APP_CONFIG.saveCredentials(url, key);
    };
  },

  // Formatters
  formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('vi-VN');
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  },

  formatDuration(seconds) {
    if (!seconds && seconds !== 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  },

  // Shared Admin Layout Injection
  async renderAppLayout({ activeMenu = 'dashboard', pageTitle = 'Dashboard' }) {
    // 1. Sidebar HTML
    const sidebarEl = document.querySelector('.app-sidebar');
    const topbarEl = document.querySelector('.app-topbar');

    let profile = null;
    if (window.auth) {
      profile = await window.auth.getCurrentProfile();
    }

    const isAdmin = profile && profile.role === 'ADMIN';
    const username = profile ? profile.username : 'Admin User';
    const email = profile ? profile.email : 'user@example.com';
    const role = profile ? profile.role : 'USER';
    const avatarUrl = profile && profile.avatar_url ? profile.avatar_url : '';
    const initial = username ? username.charAt(0).toUpperCase() : 'U';

    if (sidebarEl) {
      sidebarEl.innerHTML = `
        <div class="sidebar-brand">
          <div class="brand-icon">
            <i data-lucide="play-circle"></i>
          </div>
          <span class="brand-name">VideoAdmin</span>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">Tổng quan</div>
          <a href="dashboard.html" class="nav-item ${activeMenu === 'dashboard' ? 'active' : ''}">
            <i data-lucide="layout-dashboard"></i>
            <span>Dashboard</span>
          </a>
          <a href="videos.html" class="nav-item ${activeMenu === 'videos' ? 'active' : ''}">
            <i data-lucide="video"></i>
            <span>Videos</span>
          </a>

          <div class="nav-section-title">Quản lý hệ thống</div>
          <a href="categories.html" class="nav-item ${activeMenu === 'categories' ? 'active' : ''}">
            <i data-lucide="folder"></i>
            <span>Categories</span>
          </a>
          ${isAdmin ? `
          <a href="users.html" class="nav-item ${activeMenu === 'users' ? 'active' : ''}">
            <i data-lucide="users"></i>
            <span>Users</span>
          </a>
          ` : ''}

          <div class="nav-section-title">Cá nhân</div>
          <a href="account.html" class="nav-item ${activeMenu === 'account' ? 'active' : ''}">
            <i data-lucide="user"></i>
            <span>Account</span>
          </a>
          <button id="sidebar-logout-btn" class="nav-item" style="width: 100%; text-align: left; background: none; border: none; cursor: pointer;">
            <i data-lucide="log-out"></i>
            <span>Đăng xuất</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <a href="account.html" class="user-snippet">
            ${avatarUrl ? `<img src="${avatarUrl}" class="user-avatar" alt="Avatar">` : `<div class="user-avatar">${initial}</div>`}
            <div class="user-info">
              <div class="user-name">${username}</div>
              <span class="badge ${role === 'ADMIN' ? 'badge-admin' : 'badge-neutral'}">${role}</span>
            </div>
          </a>
        </div>
      `;
    }

    if (topbarEl) {
      topbarEl.innerHTML = `
        <div class="topbar-left">
          <button class="mobile-menu-btn" id="mobile-toggle-btn" aria-label="Toggle menu">
            <i data-lucide="menu"></i>
          </button>
          <h1 class="page-title">${pageTitle}</h1>
        </div>

        <div class="topbar-right">
          ${!window.APP_CONFIG.isConfigured() ? `
          <button class="btn btn-warning btn-sm" id="topbar-config-btn">
            <i data-lucide="settings"></i>
            <span>Cấu hình Supabase</span>
          </button>
          ` : ''}

          <a href="account.html" style="display: flex; align-items: center; gap: var(--space-3);">
            ${avatarUrl ? `<img src="${avatarUrl}" class="user-avatar" style="width: 34px; height: 34px;" alt="Avatar">` : `<div class="user-avatar" style="width: 34px; height: 34px; font-size: 13px;">${initial}</div>`}
            <span style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-main);" class="hide-mobile">${username}</span>
          </a>
        </div>
      `;
    }

    // Notice banner if Supabase is not configured yet
    const contentEl = document.querySelector('.app-content');
    if (contentEl && !window.APP_CONFIG.isConfigured()) {
      const banner = document.createElement('div');
      banner.className = 'config-banner';
      banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="alert-circle"></i>
          <span><strong>Chưa cấu hình Supabase:</strong> Bạn cần nhập Supabase Project URL và Anon Key để ứng dụng kết nối dữ liệu.</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="window.UI.showConfigModal()">Cấu hình ngay</button>
      `;
      contentEl.insertBefore(banner, contentEl.firstChild);
    }

    // Bind Mobile Drawer
    const mobileBtn = document.getElementById('mobile-toggle-btn');
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    if (mobileBtn && sidebarEl) {
      mobileBtn.onclick = () => {
        sidebarEl.classList.toggle('open');
        backdrop.classList.toggle('active');
      };
      backdrop.onclick = () => {
        sidebarEl.classList.remove('open');
        backdrop.classList.remove('active');
      };
    }

    // Bind Logout
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn && window.auth) {
      logoutBtn.onclick = async () => {
        await window.auth.signOut();
      };
    }

    // Bind Topbar Config button
    const cfgBtn = document.getElementById('topbar-config-btn');
    if (cfgBtn) {
      cfgBtn.onclick = () => this.showConfigModal();
    }

    // Initialize Lucide Icons
    if (window.lucide) {
      lucide.createIcons();
    }
  }
};
