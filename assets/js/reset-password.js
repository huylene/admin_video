/**
 * Reset Password Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();

  const form = document.getElementById('reset-form');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const alertBox = document.getElementById('auth-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.style.display = 'none';

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword.length < 6) {
      alertBox.className = '';
      alertBox.style.display = 'block';
      alertBox.style.backgroundColor = 'var(--danger-light)';
      alertBox.style.color = 'var(--danger-text)';
      alertBox.style.border = '1px solid #fecaca';
      alertBox.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      return;
    }

    if (newPassword !== confirmPassword) {
      alertBox.className = '';
      alertBox.style.display = 'block';
      alertBox.style.backgroundColor = 'var(--danger-light)';
      alertBox.style.color = 'var(--danger-text)';
      alertBox.style.border = '1px solid #fecaca';
      alertBox.textContent = 'Mật khẩu xác nhận không trùng khớp.';
      return;
    }

    submitBtn.disabled = true;
    btnText.textContent = 'Đang cập nhật...';
    btnSpinner.style.display = 'inline-block';

    try {
      if (!window.APP_CONFIG.isConfigured()) {
        window.UI.showConfigModal();
        throw new Error('Vui lòng cấu hình kết nối Supabase.');
      }

      await window.auth.updatePassword(newPassword);

      alertBox.className = '';
      alertBox.style.display = 'block';
      alertBox.style.backgroundColor = 'var(--success-light)';
      alertBox.style.color = 'var(--success-text)';
      alertBox.style.border = '1px solid #bbf7d0';
      alertBox.textContent = 'Đặt lại mật khẩu thành công! Bạn sẽ được chuyển về trang đăng nhập sau giây lát...';

      form.reset();
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      alertBox.className = '';
      alertBox.style.display = 'block';
      alertBox.style.backgroundColor = 'var(--danger-light)';
      alertBox.style.color = 'var(--danger-text)';
      alertBox.style.border = '1px solid #fecaca';
      alertBox.textContent = err.message || 'Không thể cập nhật mật khẩu. Phiên khôi phục có thể đã hết hạn.';
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Cập nhật mật khẩu';
      btnSpinner.style.display = 'none';
    }
  });
});
