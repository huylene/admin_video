/**
 * Video Create & Edit Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const profile = await window.guards.requireAuth();
  if (!profile && window.APP_CONFIG.isConfigured()) return;

  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('id');
  const isEditMode = Boolean(videoId);

  await window.UI.renderAppLayout({
    activeMenu: 'videos',
    pageTitle: isEditMode ? 'Chỉnh sửa Video' : 'Thêm Video Mới'
  });

  // UI state & elements
  const heading = document.getElementById('page-heading');
  const subheading = document.getElementById('page-subheading');
  const saveBtn = document.getElementById('save-video-btn');
  const saveBtnText = document.getElementById('save-btn-text');
  const saveBtnSpinner = document.getElementById('save-btn-spinner');
  const videoReqBadge = document.getElementById('video-required-badge');

  const titleInput = document.getElementById('video-title');
  const slugInput = document.getElementById('video-slug');
  const categorySelect = document.getElementById('video-category');
  const descInput = document.getElementById('video-description');
  const statusSelect = document.getElementById('video-status');
  const publishedAtInput = document.getElementById('video-published-at');
  const viewsInput = document.getElementById('video-views');

  // Video upload elements
  const videoDropzone = document.getElementById('video-dropzone');
  const videoFileInput = document.getElementById('video-file-input');
  const videoPreviewWrap = document.getElementById('video-preview-wrap');
  const videoPreviewPlayer = document.getElementById('video-preview-player');
  const videoFileName = document.getElementById('video-file-name');
  const videoDurationInfo = document.getElementById('video-duration-info');
  const videoUploadProgress = document.getElementById('video-upload-progress');
  const videoProgressPercent = document.getElementById('video-progress-percent');
  const videoProgressFill = document.getElementById('video-progress-fill');

  // Thumbnail upload elements
  const thumbDropzone = document.getElementById('thumb-dropzone');
  const thumbFileInput = document.getElementById('thumb-file-input');
  const thumbPreviewWrap = document.getElementById('thumb-preview-wrap');
  const thumbPreviewImg = document.getElementById('thumb-preview-img');
  const thumbUrlInput = document.getElementById('thumb-url-input');

  let selectedVideoFile = null;
  let selectedThumbFile = null;
  let extractedDuration = 0;
  let existingVideoData = null;

  if (isEditMode) {
    heading.textContent = 'Chỉnh sửa Video';
    subheading.textContent = 'Cập nhật nội dung, thay thế tệp hoặc tinh chỉnh metadata';
    videoReqBadge.textContent = 'Tùy chọn khi sửa';
    videoReqBadge.className = 'badge badge-neutral';
  } else {
    // Default published at now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    publishedAtInput.value = now.toISOString().slice(0, 16);
  }

  // Load Categories into Select
  async function loadCategories() {
    try {
      const categories = await window.api.getCategories();
      categorySelect.innerHTML = '<option value="">-- Chọn danh mục --</option>' +
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (err) {
      console.warn('Error loading categories:', err);
    }
  }

  // Load Existing Video Data if Edit
  async function loadExistingVideo() {
    if (!isEditMode) return;
    try {
      existingVideoData = await window.api.getVideoById(videoId);
      if (!existingVideoData) {
        window.UI.showToast('Không tìm thấy video cần chỉnh sửa', 'error');
        setTimeout(() => window.location.href = 'videos.html', 1500);
        return;
      }

      titleInput.value = existingVideoData.title || '';
      slugInput.value = existingVideoData.slug || '';
      categorySelect.value = existingVideoData.category_id || '';
      descInput.value = existingVideoData.description || '';
      statusSelect.value = existingVideoData.status || 'draft';
      viewsInput.value = existingVideoData.views || 0;
      extractedDuration = existingVideoData.duration_seconds || 0;

      if (existingVideoData.published_at) {
        const d = new Date(existingVideoData.published_at);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        publishedAtInput.value = d.toISOString().slice(0, 16);
      }

      // Existing video preview
      if (existingVideoData.video_path) {
        videoPreviewWrap.style.display = 'block';
        videoPreviewPlayer.src = existingVideoData.video_path;
        videoFileName.textContent = 'Tệp hiện tại trên hệ thống';
        videoDurationInfo.textContent = `Thời lượng: ${window.UI.formatDuration(extractedDuration)}`;
      }

      // Existing thumbnail preview
      if (existingVideoData.thumbnail_path) {
        thumbPreviewWrap.style.display = 'block';
        thumbPreviewImg.src = existingVideoData.thumbnail_path;
        thumbUrlInput.value = existingVideoData.thumbnail_path;
      }

    } catch (err) {
      console.error('Error fetching video:', err);
      window.UI.showToast('Không thể tải thông tin video: ' + err.message, 'error');
    }
  }

  // Video Drag & Drop Handlers
  videoDropzone.onclick = () => videoFileInput.click();
  videoDropzone.ondragover = (e) => {
    e.preventDefault();
    videoDropzone.classList.add('dragover');
  };
  videoDropzone.ondragleave = () => videoDropzone.classList.remove('dragover');
  videoDropzone.ondrop = (e) => {
    e.preventDefault();
    videoDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoSelect(e.dataTransfer.files[0]);
    }
  };
  videoFileInput.onchange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleVideoSelect(e.target.files[0]);
    }
  };

  async function handleVideoSelect(file) {
    if (!file.type.startsWith('video/')) {
      window.UI.showToast('Vui lòng chọn tệp video hợp lệ (MP4, WebM)', 'error');
      return;
    }

    selectedVideoFile = file;
    videoFileName.textContent = `${file.name} (${window.UI.formatBytes(file.size)})`;
    videoPreviewWrap.style.display = 'block';
    videoPreviewPlayer.src = URL.createObjectURL(file);

    // Auto extract duration
    extractedDuration = await window.uploader.getVideoDuration(file);
    videoDurationInfo.textContent = `Thời lượng: ${window.UI.formatDuration(extractedDuration)}`;

    // Auto generate title if title is empty
    if (!titleInput.value) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      titleInput.value = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
    }
  }

  // Thumbnail Handlers
  thumbDropzone.onclick = () => thumbFileInput.click();
  thumbDropzone.ondragover = (e) => {
    e.preventDefault();
    thumbDropzone.classList.add('dragover');
  };
  thumbDropzone.ondragleave = () => thumbDropzone.classList.remove('dragover');
  thumbDropzone.ondrop = (e) => {
    e.preventDefault();
    thumbDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleThumbSelect(e.dataTransfer.files[0]);
    }
  };
  thumbFileInput.onchange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleThumbSelect(e.target.files[0]);
    }
  };

  function handleThumbSelect(file) {
    if (!file.type.startsWith('image/')) {
      window.UI.showToast('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP)', 'error');
      return;
    }
    selectedThumbFile = file;
    thumbPreviewWrap.style.display = 'block';
    thumbPreviewImg.src = URL.createObjectURL(file);
    thumbUrlInput.value = '';
  }

  thumbUrlInput.oninput = (e) => {
    const url = e.target.value.trim();
    if (url) {
      selectedThumbFile = null;
      thumbPreviewWrap.style.display = 'block';
      thumbPreviewImg.src = url;
    }
  };

  // Helper Slug Generator
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

  titleInput.addEventListener('blur', () => {
    if (!slugInput.value && titleInput.value) {
      slugInput.value = generateSlug(titleInput.value);
    }
  });

  // Save Form Handler
  saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const slug = slugInput.value.trim() || generateSlug(title);
    const categoryId = categorySelect.value;
    const description = descInput.value.trim();
    const status = statusSelect.value;
    const publishedAt = publishedAtInput.value ? new Date(publishedAtInput.value).toISOString() : null;
    const views = parseInt(viewsInput.value, 10) || 0;

    if (!title) {
      window.UI.showToast('Vui lòng nhập tiêu đề video.', 'error');
      titleInput.focus();
      return;
    }

    if (!categoryId) {
      window.UI.showToast('Vui lòng chọn danh mục cho video.', 'error');
      categorySelect.focus();
      return;
    }

    if (!isEditMode && !selectedVideoFile) {
      window.UI.showToast('Vui lòng chọn file video để tải lên.', 'error');
      return;
    }

    // Set saving UI
    saveBtn.disabled = true;
    saveBtnText.textContent = 'Đang xử lý & lưu...';
    saveBtnSpinner.style.display = 'inline-block';

    let videoUploadResult = null;
    let thumbUploadResult = null;

    try {
      if (!window.APP_CONFIG.isConfigured()) {
        window.UI.showConfigModal();
        throw new Error('Vui lòng cấu hình kết nối Supabase trước khi tải file.');
      }

      const user = await window.auth.getCurrentUser();
      const userId = user ? user.id : 'admin';

      // 1. Upload Video if selected
      let finalVideoPath = existingVideoData ? existingVideoData.video_path : '';
      if (selectedVideoFile) {
        videoUploadProgress.style.display = 'block';
        videoProgressFill.style.width = '45%';
        videoProgressPercent.textContent = '45%';

        videoUploadResult = await window.uploader.uploadFile({
          file: selectedVideoFile,
          bucket: 'videos',
          userId: userId
        });

        videoProgressFill.style.width = '100%';
        videoProgressPercent.textContent = '100%';
        finalVideoPath = videoUploadResult.publicUrl || videoUploadResult.path;
      }

      // 2. Upload Thumbnail if selected
      let finalThumbPath = existingVideoData ? existingVideoData.thumbnail_path : '';
      if (selectedThumbFile) {
        thumbUploadResult = await window.uploader.uploadFile({
          file: selectedThumbFile,
          bucket: 'thumbnails',
          userId: userId
        });
        finalThumbPath = thumbUploadResult.publicUrl || thumbUploadResult.path;
      } else if (thumbUrlInput.value.trim()) {
        finalThumbPath = thumbUrlInput.value.trim();
      }

      // 3. Prepare Video Record Payload
      const payload = {
        title,
        slug,
        category_id: categoryId,
        description,
        status,
        published_at: publishedAt,
        views,
        duration_seconds: extractedDuration,
        video_path: finalVideoPath,
        thumbnail_path: finalThumbPath
      };

      let savedVideo = null;
      if (isEditMode) {
        savedVideo = await window.api.updateVideo(videoId, payload);
        window.UI.showToast('Cập nhật video thành công!', 'success');
      } else {
        savedVideo = await window.api.createVideo(payload);
        window.UI.showToast('Tạo video mới thành công!', 'success');
      }

      // 4. Record Storage Assets for size tracking
      if (videoUploadResult && savedVideo) {
        await window.uploader.recordStorageAsset({
          videoId: savedVideo.id,
          bucket: 'videos',
          path: videoUploadResult.path,
          assetType: 'video',
          sizeBytes: videoUploadResult.sizeBytes,
          mimeType: videoUploadResult.mimeType
        });
      }

      if (thumbUploadResult && savedVideo) {
        await window.uploader.recordStorageAsset({
          videoId: savedVideo.id,
          bucket: 'thumbnails',
          path: thumbUploadResult.path,
          assetType: 'thumbnail',
          sizeBytes: thumbUploadResult.sizeBytes,
          mimeType: thumbUploadResult.mimeType
        });
      }

      setTimeout(() => {
        window.location.href = 'videos.html';
      }, 1000);

    } catch (err) {
      console.error('Save video failed:', err);
      window.UI.showToast('Không thể lưu video: ' + err.message, 'error', 'Lỗi lưu trữ');

      // Cleanup newly uploaded files on DB failure
      if (videoUploadResult) {
        window.uploader.deleteFile({ bucket: 'videos', path: videoUploadResult.path });
      }
      if (thumbUploadResult) {
        window.uploader.deleteFile({ bucket: 'thumbnails', path: thumbUploadResult.path });
      }
    } finally {
      saveBtn.disabled = false;
      saveBtnText.textContent = isEditMode ? 'Cập nhật video' : 'Lưu video';
      saveBtnSpinner.style.display = 'none';
      videoUploadProgress.style.display = 'none';
    }
  });

  // Initial load
  await loadCategories();
  if (isEditMode) {
    await loadExistingVideo();
  }
});
