/**
 * Forgot Password Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  const form = document.getElementById('forgot-form');
  const emailInput = document.getElementById('email');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const alertBox = document.getElementById('auth-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.style.display = 'none';

    const email = emailInput.value.trim();
    if (!email) return;

    submitBtn.disabled = true;
    btnText.textContent = 'Đang gửi yêu cầu...';
    btnSpinner.style.display = 'inline-block';

    try {
      if (!window.APP_CONFIG.isConfigured()) {
        window.UI.showConfigModal();
        throw new Error('Vui lòng cấu hình kết nối Supabase trước khi tiếp tục.');
      }

      await window.auth.requestPasswordReset(email);

      alertBox.className = '';
      alertBox.style.display = 'block';
      alertBox.style.backgroundColor = 'var(--success-light)';
      alertBox.style.color = 'var(--success-text)';
      alertBox.style.border = '1px solid #bbf7d0';
      alertBox.textContent = 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn! Vui lòng kiểm tra hộp thư đến hoặc spam.';

      form.reset();
    } catch (err) {
      console.error('Password reset request error:', err);
      alertBox.className = '';
      alertBox.style.display = 'block';
      alertBox.style.backgroundColor = 'var(--danger-light)';
      alertBox.style.color = 'var(--danger-text)';
      alertBox.style.border = '1px solid #fecaca';
      alertBox.textContent = err.message || 'Không thể gửi email khôi phục. Vui lòng thử lại sau.';
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Gửi liên kết khôi phục';
      btnSpinner.style.display = 'none';
    }
  });
});
