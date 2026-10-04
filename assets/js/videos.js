/**
 * Videos Management Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const profile = await window.guards.requireAuth();
  if (!profile && window.APP_CONFIG.isConfigured()) return;

  await window.UI.renderAppLayout({
    activeMenu: 'videos',
    pageTitle: 'Quản lý Video'
  });

  // State
  let currentPage = 1;
  const pageSize = 10;
  let currentSearch = '';
  let currentCategory = '';
  let currentStatus = '';
  let currentOrderBy = 'created_at';
  let currentOrderAsc = false;
  let searchTimeout = null;

  // DOM Elements
  const tbody = document.getElementById('videos-tbody');
  const emptyState = document.getElementById('videos-empty-state');
  const pagination = document.getElementById('videos-pagination');
  const pageCountText = document.getElementById('page-count-text');
  const pageInfoText = document.getElementById('page-info-text');
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  const searchInput = document.getElementById('video-search-input');
  const categoryFilter = document.getElementById('video-category-filter');
  const statusFilter = document.getElementById('video-status-filter');
  const sortFilter = document.getElementById('video-sort-filter');
  const resetBtn = document.getElementById('reset-filters-btn');

  // Load Categories into Filter dropdown
  async function loadCategoriesFilter() {
    try {
      const categories = await window.api.getCategories();
      categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>' +
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (err) {
      console.warn('Error loading category filter:', err);
    }
  }

  // Load Videos List
  async function loadVideos() {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: var(--space-8); color: var(--text-muted);">
          <div class="spinner spinner-dark" style="margin-bottom: 8px;"></div>
          <div>Đang tải dữ liệu...</div>
        </td>
      </tr>
    `;
    emptyState.style.display = 'none';

    try {
      const result = await window.api.getVideos({
        search: currentSearch,
        categoryId: currentCategory,
        status: currentStatus,
        page: currentPage,
        pageSize: pageSize,
        orderBy: currentOrderBy,
        orderAsc: currentOrderAsc
      });

      const videos = result.data || [];
      const total = result.total || 0;
      const totalPages = result.totalPages || 1;

      pageCountText.textContent = total;
      pageInfoText.textContent = `${currentPage} / ${totalPages || 1}`;
      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;

      if (videos.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        pagination.style.display = 'none';
        return;
      }

      pagination.style.display = 'flex';
      emptyState.style.display = 'none';

      tbody.innerHTML = videos.map(v => {
        let statusBadge = '';
        if (v.status === 'published') {
          statusBadge = '<span class="badge badge-success">Đã xuất bản</span>';
        } else if (v.status === 'archived') {
          statusBadge = '<span class="badge badge-warning">Lưu trữ</span>';
        } else {
          statusBadge = '<span class="badge badge-neutral">Bản nháp</span>';
        }

        const shortId = v.id.substring(0, 8);
        const thumbUrl = v.thumbnail_path || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60';
        const catName = v.category ? v.category.name : 'Chưa phân loại';

        return `
          <tr data-video-id="${v.id}">
            <td style="font-family: monospace; font-size: 12px; color: var(--text-subtle);" title="${v.id}">
              #${shortId}
            </td>
            <td>
              <img src="${thumbUrl}" class="table-thumb" alt="Thumbnail" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2242%22 viewBox=%220 0 64 42%22><rect width=%2264%22 height=%2242%22 fill=%22%23e2e8f0%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2210%22 fill=%22%2394a3b8%22>Video</text></svg>'">
            </td>
            <td>
              <div style="font-weight: 600; color: var(--text-main);">${v.title}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 2px;">
                ${v.duration_seconds ? window.UI.formatDuration(v.duration_seconds) : ''}
              </div>
            </td>
            <td><span class="badge badge-info">${catName}</span></td>
            <td style="font-weight: 600;">${window.UI.formatNumber(v.views)}</td>
            <td>${statusBadge}</td>
            <td style="font-size: var(--font-size-xs); color: var(--text-muted);">${window.UI.formatDate(v.created_at)}</td>
            <td style="text-align: right;">
              <div style="display: inline-flex; gap: var(--space-1);">
                <a href="video-edit.html?id=${v.id}" class="btn btn-ghost btn-sm" title="Chỉnh sửa">
                  <i data-lucide="edit-3"></i>
                </a>
                <button class="btn btn-ghost btn-sm delete-video-btn" data-id="${v.id}" data-title="${v.title.replace(/"/g, '&quot;')}" title="Xóa video" style="color: var(--danger);">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();

      // Bind delete buttons
      document.querySelectorAll('.delete-video-btn').forEach(btn => {
        btn.onclick = () => {
          const videoId = btn.getAttribute('data-id');
          const title = btn.getAttribute('data-title');
          confirmDeleteVideo(videoId, title);
        };
      });

    } catch (err) {
      console.error('Error loading videos:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: var(--space-6); color: var(--danger);">
            Lỗi nạp danh sách video: ${err.message || 'Vui lòng thử lại'}
          </td>
        </tr>
      `;
    }
  }

  // Delete Video confirmation
  function confirmDeleteVideo(videoId, title) {
    window.UI.showConfirmModal({
      title: 'Xóa video vĩnh viễn?',
      message: `Bạn có chắc muốn xóa video "<strong>${title}</strong>"? Hành động này sẽ xóa dữ liệu và các tệp video/thumbnail tương ứng trên Storage và không thể hoàn tác.`,
      confirmText: 'Xóa video',
      cancelText: 'Hủy',
      isDanger: true,
      onConfirm: async () => {
        try {
          window.UI.showToast('Đang thực hiện xóa video...', 'info');
          await window.api.deleteVideo(videoId);
          window.UI.showToast('Đã xóa video thành công!', 'success');
          loadVideos();
        } catch (err) {
          console.error('Delete error:', err);
          window.UI.showToast('Không thể xóa video: ' + err.message, 'error', 'Lỗi');
        }
      }
    });
  }

  // Event Listeners
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value.trim();
      currentPage = 1;
      loadVideos();
    }, 400);
  });

  categoryFilter.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    currentPage = 1;
    loadVideos();
  });

  statusFilter.addEventListener('change', (e) => {
    currentStatus = e.target.value;
    currentPage = 1;
    loadVideos();
  });

  sortFilter.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'created_at-desc') {
      currentOrderBy = 'created_at';
      currentOrderAsc = false;
    } else if (val === 'created_at-asc') {
      currentOrderBy = 'created_at';
      currentOrderAsc = true;
    } else if (val === 'views-desc') {
      currentOrderBy = 'views';
      currentOrderAsc = false;
    } else if (val === 'views-asc') {
      currentOrderBy = 'views';
      currentOrderAsc = true;
    }
    currentPage = 1;
    loadVideos();
  });

  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    categoryFilter.value = '';
    statusFilter.value = '';
    sortFilter.value = 'created_at-desc';
    currentSearch = '';
    currentCategory = '';
    currentStatus = '';
    currentOrderBy = 'created_at';
    currentOrderAsc = false;
    currentPage = 1;
    loadVideos();
  });

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadVideos();
    }
  });

  nextBtn.addEventListener('click', () => {
    currentPage++;
    loadVideos();
  });

  // Initial Load
  await loadCategoriesFilter();
  await loadVideos();
});
