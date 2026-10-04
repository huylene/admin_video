/**
 * Account Profile & Security Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const profile = await window.guards.requireAuth();
  if (!profile && window.APP_CONFIG.isConfigured()) return;

  await window.UI.renderAppLayout({
    activeMenu: 'account',
    pageTitle: 'Hồ sơ Tài khoản'
  });

  const avatarPreview = document.getElementById('profile-avatar-preview');
  const avatarFileInput = document.getElementById('avatar-file-input');
  const changeAvatarBtn = document.getElementById('change-avatar-btn');
  const displayName = document.getElementById('profile-display-name');
  const roleBadge = document.getElementById('profile-role-badge');
  const usernameInput = document.getElementById('profile-username');
  const emailInput = document.getElementById('profile-email');
  const createdAtInput = document.getElementById('profile-created-at');

  const profileForm = document.getElementById('profile-form');
  const profileBtnText = document.getElementById('profile-btn-text');
  const profileBtnSpinner = document.getElementById('profile-btn-spinner');
  const saveProfileBtn = document.getElementById('save-profile-btn');

  const passwordForm = document.getElementById('password-form');
  const newPassInput = document.getElementById('new-pass');
  const confirmPassInput = document.getElementById('confirm-pass');
  const savePasswordBtn = document.getElementById('save-password-btn');
  const passBtnText = document.getElementById('pass-btn-text');
  const passBtnSpinner = document.getElementById('pass-btn-spinner');

  let currentAvatarUrl = '';

  function populateProfile(p) {
    if (!p) return;
    displayName.textContent = p.username || 'Người dùng';
    usernameInput.value = p.username || '';
    emailInput.value = p.email || '';
    createdAtInput.value = window.UI.formatDate(p.created_at);

    roleBadge.textContent = p.role || 'USER';
    roleBadge.className = `badge ${p.role === 'ADMIN' ? 'badge-admin' : 'badge-neutral'}`;

    currentAvatarUrl = p.avatar_url || '';
    if (currentAvatarUrl) {
      avatarPreview.innerHTML = `<img src="${currentAvatarUrl}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
      avatarPreview.textContent = (p.username || 'U').charAt(0).toUpperCase();
    }
  }

  populateProfile(profile);

  // Avatar upload
  changeAvatarBtn.onclick = () => avatarFileInput.click();
  avatarFileInput.onchange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      window.UI.showToast('Đang tải lên ảnh đại diện...', 'info');
      const user = await window.auth.getCurrentUser();
      const res = await window.uploader.uploadFile({
        file: file,
        bucket: 'avatars',
        userId: user ? user.id : 'users'
      });

      const updated = await window.auth.updateProfile({ avatar_url: res.publicUrl });
      populateProfile(updated);
      window.UI.showToast('Cập nhật ảnh đại diện thành công!', 'success');
      // Re-render layout to update header avatar
      await window.UI.renderAppLayout({ activeMenu: 'account', pageTitle: 'Hồ sơ Tài khoản' });
    } catch (err) {
      console.error('Avatar upload error:', err);
      window.UI.showToast('Không thể đổi avatar: ' + err.message, 'error');
    }
  };

  // Profile update
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUsername = usernameInput.value.trim();
    if (!newUsername) {
      window.UI.showToast('Tên người dùng không được để trống.', 'error');
      return;
    }

    saveProfileBtn.disabled = true;
    profileBtnText.textContent = 'Đang lưu...';
    profileBtnSpinner.style.display = 'inline-block';

    try {
      const updated = await window.auth.updateProfile({ username: newUsername });
      populateProfile(updated);
      window.UI.showToast('Đã lưu thông tin hồ sơ!', 'success');
      await window.UI.renderAppLayout({ activeMenu: 'account', pageTitle: 'Hồ sơ Tài khoản' });
    } catch (err) {
      console.error('Update profile error:', err);
      window.UI.showToast('Không thể cập nhật hồ sơ: ' + err.message, 'error');
    } finally {
      saveProfileBtn.disabled = false;
      profileBtnText.textContent = 'Lưu thông tin';
      profileBtnSpinner.style.display = 'none';
    }
  });

  // Password update
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPass = newPassInput.value;
    const confirmPass = confirmPassInput.value;

    if (newPass.length < 6) {
      window.UI.showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
      return;
    }

    if (newPass !== confirmPass) {
      window.UI.showToast('Mật khẩu xác nhận không trùng khớp.', 'error');
      return;
    }

    savePasswordBtn.disabled = true;
    passBtnText.textContent = 'Đang đổi mật khẩu...';
    passBtnSpinner.style.display = 'inline-block';

    try {
      await window.auth.updatePassword(newPass);
      window.UI.showToast('Đổi mật khẩu thành công!', 'success');
      passwordForm.reset();
    } catch (err) {
      console.error('Change password error:', err);
      window.UI.showToast('Lỗi đổi mật khẩu: ' + err.message, 'error');
    } finally {
      savePasswordBtn.disabled = false;
      passBtnText.textContent = 'Cập nhật mật khẩu';
      passBtnSpinner.style.display = 'none';
    }
  });
});
