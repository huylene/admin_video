/**
 * Data Access Layer (Videos, Categories, Users, Analytics)
 */

window.api = {
  // ================= CATEGORIES =================
  async getCategories() {
    if (!window.sb) return [];
    const { data, error } = await window.sb
      .from('video_categories')
      .select('*, videos:videos(count)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return (data || []).map(cat => ({
      ...cat,
      videoCount: cat.videos && cat.videos[0] ? cat.videos[0].count : 0
    }));
  },

  async createCategory({ name, slug, description }) {
    if (!window.sb) throw new Error('Supabase client chưa khởi tạo');
    const { data, error } = await window.sb
      .from('video_categories')
      .insert({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description ? description.trim() : null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCategory(id, { name, slug, description }) {
    if (!window.sb) throw new Error('Supabase client chưa khởi tạo');
    const { data, error } = await window.sb
      .from('video_categories')
      .update({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description ? description.trim() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCategory(id) {
    if (!window.sb) throw new Error('Supabase client chưa khởi tạo');
    
    // Check if category has associated videos
    const { count, error: countErr } = await window.sb
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countErr) throw countErr;
    if (count > 0) {
      throw new Error(`Không thể xóa: Danh mục này đang có ${count} video liên kết.`);
    }

    const { error } = await window.sb
      .from('video_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // ================= VIDEOS =================
  async getVideos({ search = '', categoryId = '', status = '', page = 1, pageSize = 10, orderBy = 'created_at', orderAsc = false } = {}) {
    if (!window.sb) return { data: [], total: 0, page, pageSize };

    let query = window.sb
      .from('videos')
      .select('*, category:video_categories(id, name, slug)', { count: 'exact' });

    if (search) {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.order(orderBy, { ascending: orderAsc }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async getVideoById(id) {
    if (!window.sb) return null;
    const { data, error } = await window.sb
      .from('videos')
      .select('*, category:video_categories(id, name, slug), storage_assets(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createVideo(payload) {
    if (!window.sb) throw new Error('Supabase client chưa khởi tạo');
    const user = await window.auth.getCurrentUser();

    const videoData = {
      ...payload,
      created_by: user ? user.id : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await window.sb
      .from('videos')
      .insert(videoData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateVideo(id, payload) {
    if (!window.sb) throw new Error('Supabase client chưa khởi tạo');

    const videoData = {
      ...payload,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await window.sb
      .from('videos')
      .update(videoData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteVideo(id) {
    if (!window.sb) throw new Error('Supabase client chưa khởi tạo');

    // 1. Fetch related storage assets to delete physical files
    try {
      const { data: assets } = await window.sb
        .from('storage_assets')
        .select('*')
        .eq('video_id', id);

      if (assets && assets.length > 0) {
        for (const asset of assets) {
          await window.uploader.deleteFile({ bucket: asset.bucket, path: asset.path });
        }
      }
    } catch (err) {
      console.warn('Warning deleting storage assets:', err);
    }

    // 2. Delete database record (cascades to storage_assets and video_views)
    const { error } = await window.sb
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // ================= USERS (ADMIN ONLY) =================
  async getUsers({ search = '', role = '', page = 1, pageSize = 15 } = {}) {
    if (!window.sb) return { data: [], total: 0 };

    let query = window.sb
      .from('profiles')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`username.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async updateUserRole(userId, newRole) {
    if (!window.sb) throw new Error('Supabase client chưa khởi tạo');
    const { data, error } = await window.sb
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ================= DASHBOARD ANALYTICS =================
  async getDashboardMetrics() {
    if (!window.sb) {
      return { totalVideos: 0, totalViews: 0, totalStorageBytes: 0 };
    }

    // Total videos count
    const { count: totalVideos, error: vidErr } = await window.sb
      .from('videos')
      .select('*', { count: 'exact', head: true });

    // Total views sum
    const { data: viewsData, error: viewErr } = await window.sb
      .from('videos')
      .select('views');

    const totalViews = (viewsData || []).reduce((sum, item) => sum + Number(item.views || 0), 0);

    // Total storage bytes sum
    const { data: storageData, error: stErr } = await window.sb
      .from('storage_assets')
      .select('size_bytes');

    const totalStorageBytes = (storageData || []).reduce((sum, item) => sum + Number(item.size_bytes || 0), 0);

    return {
      totalVideos: totalVideos || 0,
      totalViews: totalViews || 0,
      totalStorageBytes: totalStorageBytes || 0
    };
  },

  async getTopVideos(limit = 10) {
    if (!window.sb) return [];
    const { data, error } = await window.sb
      .from('videos')
      .select('id, title, views, thumbnail_path, category:video_categories(name)')
      .order('views', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getViewsTrend({ groupBy = 'day' } = {}) {
    if (!window.sb) return { labels: [], data: [] };

    // Fetch video views logged in the past 30 days or months
    const now = new Date();
    let startDate = new Date();

    if (groupBy === 'month') {
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
    } else {
      startDate.setDate(now.getDate() - 29);
    }

    const { data: viewsLog, error } = await window.sb
      .from('video_views')
      .select('viewed_at')
      .gte('viewed_at', startDate.toISOString())
      .order('viewed_at', { ascending: true });

    // Aggregate counts
    const countsMap = {};

    if (groupBy === 'month') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
        countsMap[key] = 0;
      }

      (viewsLog || []).forEach(item => {
        const d = new Date(item.viewed_at);
        const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
        if (countsMap[key] !== undefined) {
          countsMap[key]++;
        }
      });
    } else {
      // Past 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = `${d.getDate()}/${d.getMonth() + 1}`;
        countsMap[key] = 0;
      }

      (viewsLog || []).forEach(item => {
        const d = new Date(item.viewed_at);
        const key = `${d.getDate()}/${d.getMonth() + 1}`;
        if (countsMap[key] !== undefined) {
          countsMap[key]++;
        }
      });
    }

    return {
      labels: Object.keys(countsMap),
      data: Object.values(countsMap)
    };
  }
};
