/**
 * Supabase Storage Upload & Asset Management
 */

window.uploader = {
  // Sanitize filename for safe storage path
  getSafeFileName(filename) {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-');
  },

  // Extract video duration from video file
  getVideoDuration(file) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration) || 0);
      };
      video.onerror = function () {
        resolve(0);
      };
      video.src = URL.createObjectURL(file);
    });
  },

  // Upload file to Supabase Storage
  async uploadFile({ file, bucket, userId = 'general', onProgress }) {
    if (!window.sb) throw new Error('Supabase client chưa khởi tạo');
    if (!file) throw new Error('Không có file để upload');

    // Validation
    const isVideo = bucket === 'videos';
    const maxSize = isVideo ? 200 * 1024 * 1024 : 10 * 1024 * 1024; // 200MB video, 10MB image

    if (file.size > maxSize) {
      throw new Error(`Kích thước file vượt quá giới hạn cho phép (${isVideo ? '200MB' : '10MB'})`);
    }

    if (isVideo && !file.type.startsWith('video/')) {
      throw new Error('Vui lòng chọn file video hợp lệ (MP4, WebM, QuickTime)');
    }

    if (!isVideo && !file.type.startsWith('image/')) {
      throw new Error('Vui lòng chọn file hình ảnh hợp lệ (JPEG, PNG, WebP)');
    }

    const timestamp = Date.now();
    const safeName = this.getSafeFileName(file.name);
    const filePath = `${userId}/${timestamp}-${safeName}`;

    // Upload to bucket
    const { data, error } = await window.sb.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = window.sb.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      bucket,
      path: filePath,
      fullPath: data.path,
      publicUrl: urlData.publicUrl,
      sizeBytes: file.size,
      mimeType: file.type
    };
  },

  // Record storage asset entry for calculating storage KPI
  async recordStorageAsset({ videoId, bucket, path, assetType, sizeBytes, mimeType }) {
    if (!window.sb) return;
    try {
      const { error } = await window.sb
        .from('storage_assets')
        .insert({
          video_id: videoId,
          bucket: bucket,
          path: path,
          asset_type: assetType,
          size_bytes: sizeBytes,
          mime_type: mimeType
        });
      if (error) console.warn('Record storage asset warning:', error.message);
    } catch (err) {
      console.warn('Failed to record storage asset:', err);
    }
  },

  // Delete file from bucket
  async deleteFile({ bucket, path }) {
    if (!window.sb || !path) return;
    try {
      await window.sb.storage.from(bucket).remove([path]);
    } catch (err) {
      console.warn(`Failed to delete ${path} from ${bucket}:`, err);
    }
  }
};
