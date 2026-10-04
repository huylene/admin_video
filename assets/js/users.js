/**
 * Users Management Controller (ADMIN)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const profile = await window.guards.requireAdmin();
  if (!profile && window.APP_CONFIG.isConfigured()) return;

  await window.UI.renderAppLayout({
    activeMenu: 'users',
    pageTitle: 'Quản lý Người dùng'
  });

  const tbody = document.getElementById('users-tbody');
  const emptyState = document.getElementById('users-empty-state');
  const searchInput = document.getElementById('user-search-input');
  const roleFilter = document.getElementById('user-role-filter');
  const resetBtn = document.getElementById('reset-user-filter-btn');

  let currentSearch = '';
  let currentRole = '';
  let searchTimeout = null;

  async function loadUsers() {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: var(--space-8); color: var(--text-muted);">
          <div class="spinner spinner-dark" style="margin-bottom: 8px;"></div>
          <div>Đang nạp danh sách...</div>
        </td>
      </tr>
    `;

    try {
      const result = await window.api.getUsers({
        search: currentSearch,
        role: currentRole
      });

      const users = result.data || [];

      if (users.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
      }

      emptyState.style.display = 'none';

      tbody.innerHTML = users.map(u => {
        const initial = u.username ? u.username.charAt(0).toUpperCase() : 'U';
        const isCurrentAuthUser = profile && profile.id === u.id;
        const targetNewRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';

        return `
          <tr data-user-id="${u.id}">
            <td>
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                ${u.avatar_url ? `<img src="${u.avatar_url}" class="user-avatar" style="width: 32px; height: 32px;" alt="Avatar">` : `<div class="user-avatar" style="width: 32px; height: 32px; font-size: 12px;">${initial}</div>`}
                <div>
                  <div style="font-weight: 600; color: var(--text-main);">
                    ${u.username}
                    ${isCurrentAuthUser ? '<span style="font-size: 11px; color: var(--primary); font-weight: normal;">(Bạn)</span>' : ''}
                  </div>
                  <div style="font-size: 11px; color: var(--text-subtle); font-family: monospace;">#${u.id.substring(0, 8)}</div>
                </div>
              </div>
            </td>
            <td>${u.email}</td>
            <td>
              <span class="badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-neutral'}">
                ${u.role}
              </span>
            </td>
            <td>
              <span class="badge badge-success">Hoạt động</span>
            </td>
            <td style="font-size: var(--font-size-xs); color: var(--text-muted);">${window.UI.formatDate(u.created_at)}</td>
            <td style="text-align: right;">
              ${!isCurrentAuthUser ? `
                <button class="btn btn-outline btn-sm change-role-btn" data-id="${u.id}" data-name="${u.username}" data-current-role="${u.role}" data-new-role="${targetNewRole}">
                  Đổi sang ${targetNewRole}
                </button>
              ` : `
                <span style="font-size: var(--font-size-xs); color: var(--text-subtle);">Hiện tại</span>
              `}
            </td>
          </tr>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();

      // Bind change role buttons
      document.querySelectorAll('.change-role-btn').forEach(btn => {
        btn.onclick = () => {
          const userId = btn.getAttribute('data-id');
          const username = btn.getAttribute('data-name');
          const currentRole = btn.getAttribute('data-current-role');
          const newRole = btn.getAttribute('data-new-role');
          confirmChangeRole(userId, username, currentRole, newRole);
        };
      });

    } catch (err) {
      console.error('Error fetching users:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-6); color: var(--danger);">
            Lỗi nạp người dùng: ${err.message || 'Vui lòng thử lại'}
          </td>
        </tr>
      `;
    }
  }

  function confirmChangeRole(userId, username, currentRole, newRole) {
    window.UI.showConfirmModal({
      title: 'Đổi vai trò người dùng?',
      message: `Bạn có muốn đổi vai trò của người dùng <strong>${username}</strong> từ <strong>${currentRole}</strong> sang <strong>${newRole}</strong>?`,
      confirmText: `Đổi sang ${newRole}`,
      cancelText: 'Hủy',
      isDanger: newRole === 'USER',
      onConfirm: async () => {
        try {
          await window.api.updateUserRole(userId, newRole);
          window.UI.showToast(`Đã cập nhật vai trò ${newRole} cho ${username}!`, 'success');
          loadUsers();
        } catch (err) {
          window.UI.showToast('Không thể đổi vai trò: ' + err.message, 'error');
        }
      }
    });
  }

  // Events
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value.trim();
      loadUsers();
    }, 400);
  });

  roleFilter.addEventListener('change', (e) => {
    currentRole = e.target.value;
    loadUsers();
  });

  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    roleFilter.value = '';
    currentSearch = '';
    currentRole = '';
    loadUsers();
  });

  await loadUsers();
});
