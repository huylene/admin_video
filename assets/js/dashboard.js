/**
 * Dashboard Controller & Analytics Visualization
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Guard check
  const profile = await window.guards.requireAuth();
  if (!profile && window.APP_CONFIG.isConfigured()) return;

  // 2. Render Shared Layout
  await window.UI.renderAppLayout({
    activeMenu: 'dashboard',
    pageTitle: 'Dashboard'
  });

  // Chart instances
  let barChart = null;
  let lineChart = null;
  let currentTrendFilter = 'day';

  const kpiVideos = document.getElementById('kpi-videos');
  const kpiViews = document.getElementById('kpi-views');
  const kpiStorage = document.getElementById('kpi-storage');
  const refreshBtn = document.getElementById('refresh-dashboard-btn');
  const trendDayBtn = document.getElementById('trend-day-btn');
  const trendMonthBtn = document.getElementById('trend-month-btn');

  // Load KPI cards
  async function loadMetrics() {
    try {
      const metrics = await window.api.getDashboardMetrics();
      kpiVideos.textContent = window.UI.formatNumber(metrics.totalVideos);
      kpiViews.textContent = window.UI.formatNumber(metrics.totalViews);
      kpiStorage.textContent = window.UI.formatBytes(metrics.totalStorageBytes);
    } catch (err) {
      console.warn('Load metrics error:', err);
      kpiVideos.textContent = '0';
      kpiViews.textContent = '0';
      kpiStorage.textContent = '0 B';
    }
  }

  // Load Top 10 Videos Bar Chart
  async function loadTopVideosChart() {
    const canvas = document.getElementById('topVideosChart');
    const emptyState = document.getElementById('bar-chart-empty');
    if (!canvas) return;

    try {
      const topVideos = await window.api.getTopVideos(10);

      if (!topVideos || topVideos.length === 0) {
        canvas.style.display = 'none';
        emptyState.style.display = 'block';
        return;
      }

      canvas.style.display = 'block';
      emptyState.style.display = 'none';

      // Truncate labels for chart axis
      const labels = topVideos.map(v => v.title.length > 18 ? v.title.substring(0, 18) + '...' : v.title);
      const fullTitles = topVideos.map(v => v.title);
      const data = topVideos.map(v => Number(v.views || 0));

      if (barChart) barChart.destroy();

      const ctx = canvas.getContext('2d');
      barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Lượt xem',
            data: data,
            backgroundColor: 'rgba(79, 70, 229, 0.85)',
            borderColor: '#4f46e5',
            borderWidth: 1,
            borderRadius: 6,
            hoverBackgroundColor: '#4338ca'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: function (items) {
                  const idx = items[0].dataIndex;
                  return fullTitles[idx] || '';
                },
                label: function (item) {
                  return ` ${window.UI.formatNumber(item.raw)} lượt xem`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#64748b', font: { size: 11 } }
            },
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: {
                color: '#64748b',
                font: { size: 11 },
                callback: function (val) {
                  return window.UI.formatNumber(val);
                }
              }
            }
          }
        }
      });
    } catch (err) {
      console.warn('Top videos chart error:', err);
    }
  }

  // Load Views Trend Line Chart
  async function loadViewsTrendChart(groupBy = 'day') {
    const canvas = document.getElementById('viewsTrendChart');
    const emptyState = document.getElementById('line-chart-empty');
    if (!canvas) return;

    try {
      const trend = await window.api.getViewsTrend({ groupBy });

      if (!trend || !trend.labels || trend.labels.length === 0) {
        canvas.style.display = 'none';
        emptyState.style.display = 'block';
        return;
      }

      canvas.style.display = 'block';
      emptyState.style.display = 'none';

      if (lineChart) lineChart.destroy();

      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      lineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trend.labels,
          datasets: [{
            label: 'Lượt xem',
            data: trend.data,
            borderColor: '#10b981',
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: '#10b981'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (item) {
                  return ` ${window.UI.formatNumber(item.raw)} lượt xem`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#64748b', font: { size: 10 } }
            },
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' },
              ticks: {
                color: '#64748b',
                font: { size: 11 },
                callback: function (val) {
                  return window.UI.formatNumber(val);
                }
              }
            }
          }
        }
      });
    } catch (err) {
      console.warn('Trend chart error:', err);
    }
  }

  // Load Recent Videos in Table
  async function loadRecentVideos() {
    const tbody = document.getElementById('recent-videos-tbody');
    if (!tbody) return;

    try {
      const result = await window.api.getVideos({ page: 1, pageSize: 5, orderBy: 'created_at', orderAsc: false });
      const videos = result.data || [];

      if (videos.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: var(--space-8); color: var(--text-muted);">
              Chưa có video nào trong hệ thống. <a href="video-edit.html" style="color: var(--primary); font-weight: 600;">Tạo video mới</a>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = videos.map(v => {
        let statusBadge = '';
        if (v.status === 'published') {
          statusBadge = '<span class="badge badge-success">Đã xuất bản</span>';
        } else if (v.status === 'archived') {
          statusBadge = '<span class="badge badge-warning">Lưu trữ</span>';
        } else {
          statusBadge = '<span class="badge badge-neutral">Bản nháp</span>';
        }

        const thumbUrl = v.thumbnail_path || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60';
        const catName = v.category ? v.category.name : 'Chưa phân loại';

        return `
          <tr>
            <td>
              <img src="${thumbUrl}" class="table-thumb" alt="Thumbnail" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2242%22 viewBox=%220 0 64 42%22><rect width=%2264%22 height=%2242%22 fill=%22%23e2e8f0%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2210%22 fill=%22%2394a3b8%22>Video</text></svg>'">
            </td>
            <td>
              <div style="font-weight: 600; color: var(--text-main);">${v.title}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-subtle);">${v.duration_seconds ? window.UI.formatDuration(v.duration_seconds) : ''}</div>
            </td>
            <td><span class="badge badge-info">${catName}</span></td>
            <td style="font-weight: 600;">${window.UI.formatNumber(v.views)}</td>
            <td>${statusBadge}</td>
            <td style="color: var(--text-muted); font-size: var(--font-size-xs);">${window.UI.formatDate(v.created_at)}</td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.warn('Recent videos error:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-4); color: var(--danger);">
            Không thể tải danh sách video gần đây.
          </td>
        </tr>
      `;
    }
  }

  // Filter Buttons event
  trendDayBtn.addEventListener('click', () => {
    if (currentTrendFilter === 'day') return;
    currentTrendFilter = 'day';
    trendDayBtn.className = 'btn btn-sm btn-primary';
    trendMonthBtn.className = 'btn btn-sm btn-outline';
    loadViewsTrendChart('day');
  });

  trendMonthBtn.addEventListener('click', () => {
    if (currentTrendFilter === 'month') return;
    currentTrendFilter = 'month';
    trendMonthBtn.className = 'btn btn-sm btn-primary';
    trendDayBtn.className = 'btn btn-sm btn-outline';
    loadViewsTrendChart('month');
  });

  // Refresh
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    window.UI.showToast('Đang làm mới số liệu...', 'info');
    await Promise.all([
      loadMetrics(),
      loadTopVideosChart(),
      loadViewsTrendChart(currentTrendFilter),
      loadRecentVideos()
    ]);
    refreshBtn.disabled = false;
    window.UI.showToast('Số liệu đã được cập nhật!', 'success');
  });

  // Initial Load
  await Promise.all([
    loadMetrics(),
    loadTopVideosChart(),
    loadViewsTrendChart(currentTrendFilter),
    loadRecentVideos()
  ]);

  if (window.lucide) lucide.createIcons();
});
