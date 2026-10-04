/**
 * Categories Management Controller (ADMIN)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const profile = await window.guards.requireAdmin();
  if (!profile && window.APP_CONFIG.isConfigured()) return;

  await window.UI.renderAppLayout({
    activeMenu: 'categories',
    pageTitle: 'Quản lý Danh mục'
  });

  const tbody = document.getElementById('categories-tbody');
  const emptyState = document.getElementById('categories-empty-state');
  const modal = document.getElementById('category-modal');
  const modalTitle = document.getElementById('cat-modal-title');
  const form = document.getElementById('category-form');
  const editIdInput = document.getElementById('cat-edit-id');
  const nameInput = document.getElementById('cat-name');
  const slugInput = document.getElementById('cat-slug');
  const descInput = document.getElementById('cat-desc');
  const saveBtn = document.getElementById('save-cat-btn');
  const saveBtnText = document.getElementById('save-cat-text');
  const saveBtnSpinner = document.getElementById('save-cat-spinner');

  let categoriesList = [];

  function generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  nameInput.addEventListener('input', () => {
    if (!editIdInput.value) {
      slugInput.value = generateSlug(nameInput.value);
    }
  });

  function openModal(category = null) {
    if (category) {
      modalTitle.textContent = 'Chỉnh sửa Danh mục';
      editIdInput.value = category.id;
      nameInput.value = category.name;
      slugInput.value = category.slug;
      descInput.value = category.description || '';
      saveBtnText.textContent = 'Lưu thay đổi';
    } else {
      modalTitle.textContent = 'Thêm Danh mục Mới';
      editIdInput.value = '';
      form.reset();
      saveBtnText.textContent = 'Thêm danh mục';
    }
    modal.classList.add('active');
    nameInput.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  document.getElementById('open-create-category-btn').onclick = () => openModal();
  document.getElementById('empty-create-btn').onclick = () => openModal();
  document.getElementById('close-cat-modal-btn').onclick = closeModal;
  document.getElementById('cancel-cat-modal-btn').onclick = closeModal;

  // Load Categories
  async function loadCategories() {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: var(--space-8); color: var(--text-muted);">
          <div class="spinner spinner-dark" style="margin-bottom: 8px;"></div>
          <div>Đang nạp danh mục...</div>
        </td>
      </tr>
    `;

    try {
      categoriesList = await window.api.getCategories();

      if (categoriesList.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
      }

      emptyState.style.display = 'none';

      tbody.innerHTML = categoriesList.map(cat => {
        return `
          <tr data-cat-id="${cat.id}">
            <td style="font-weight: 600; color: var(--text-main);">${cat.name}</td>
            <td><code style="background-color: var(--bg-subtle); padding: 2px 6px; border-radius: 4px; font-size: 12px;">${cat.slug}</code></td>
            <td style="color: var(--text-muted); font-size: var(--font-size-xs); max-width: 280px;">${cat.description || '—'}</td>
            <td>
              <span class="badge ${cat.videoCount > 0 ? 'badge-info' : 'badge-neutral'}">
                ${cat.videoCount} video
              </span>
            </td>
            <td style="font-size: var(--font-size-xs); color: var(--text-muted);">${window.UI.formatDate(cat.created_at)}</td>
            <td style="text-align: right;">
              <div style="display: inline-flex; gap: var(--space-1);">
                <button class="btn btn-ghost btn-sm edit-cat-btn" data-id="${cat.id}" title="Sửa danh mục">
                  <i data-lucide="edit-3"></i>
                </button>
                <button class="btn btn-ghost btn-sm delete-cat-btn" data-id="${cat.id}" data-name="${cat.name.replace(/"/g, '&quot;')}" data-count="${cat.videoCount}" title="Xóa danh mục" style="color: var(--danger);">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();

      // Bind edit buttons
      document.querySelectorAll('.edit-cat-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          const cat = categoriesList.find(c => c.id === id);
          if (cat) openModal(cat);
        };
      });

      // Bind delete buttons
      document.querySelectorAll('.delete-cat-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          const name = btn.getAttribute('data-name');
          const count = parseInt(btn.getAttribute('data-count'), 10) || 0;
          confirmDeleteCategory(id, name, count);
        };
      });

    } catch (err) {
      console.error('Error fetching categories:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-6); color: var(--danger);">
            Lỗi nạp danh mục: ${err.message || 'Vui lòng thử lại'}
          </td>
        </tr>
      `;
    }
  }

  // Delete Category with Guard
  function confirmDeleteCategory(id, name, videoCount) {
    if (videoCount > 0) {
      window.UI.showToast(`Không thể xóa danh mục "${name}" vì đang có ${videoCount} video liên kết!`, 'warning', 'Cảnh báo');
      return;
    }

    window.UI.showConfirmModal({
      title: 'Xóa danh mục?',
      message: `Bạn có chắc muốn xóa danh mục "<strong>${name}</strong>"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa danh mục',
      cancelText: 'Hủy',
      isDanger: true,
      onConfirm: async () => {
        try {
          await window.api.deleteCategory(id);
          window.UI.showToast('Đã xóa danh mục thành công!', 'success');
          loadCategories();
        } catch (err) {
          window.UI.showToast(err.message, 'error', 'Không thể xóa');
        }
      }
    });
  }

  // Form Submit (Create / Edit)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const slug = slugInput.value.trim();
    const description = descInput.value.trim();
    const editId = editIdInput.value;

    if (!name || !slug) {
      window.UI.showToast('Vui lòng nhập tên và slug của danh mục.', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtnSpinner.style.display = 'inline-block';

    try {
      if (editId) {
        await window.api.updateCategory(editId, { name, slug, description });
        window.UI.showToast('Cập nhật danh mục thành công!', 'success');
      } else {
        await window.api.createCategory({ name, slug, description });
        window.UI.showToast('Thêm danh mục mới thành công!', 'success');
      }
      closeModal();
      loadCategories();
    } catch (err) {
      console.error('Save category error:', err);
      window.UI.showToast(err.message || 'Lỗi khi lưu danh mục', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtnSpinner.style.display = 'none';
    }
  });

  await loadCategories();
});
