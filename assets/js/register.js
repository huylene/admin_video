/**
 * Register Page Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();

  await window.guards.redirectIfAuthenticated();

  const form = document.getElementById('register-form');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const errorAlert = document.getElementById('auth-error-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorAlert.style.display = 'none';

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!username || !email || !password) {
      errorAlert.textContent = 'Vui lòng điền đầy đủ các thông tin bắt buộc.';
      errorAlert.style.display = 'block';
      return;
    }

    if (password.length < 6) {
      errorAlert.textContent = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
      errorAlert.style.display = 'block';
      return;
    }

    if (password !== confirmPassword) {
      errorAlert.textContent = 'Mật khẩu xác nhận không khớp.';
      errorAlert.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    btnText.textContent = 'Đang xử lý đăng ký...';
    btnSpinner.style.display = 'inline-block';

    try {
      if (!window.APP_CONFIG.isConfigured()) {
        window.UI.showConfigModal();
        throw new Error('Vui lòng cấu hình kết nối Supabase trước khi tiếp tục.');
      }

      const res = await window.auth.signUp(username, email, password);

      window.UI.showToast('Đăng ký tài khoản thành công! Vui lòng đăng nhập.', 'success', 'Thành công');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    } catch (err) {
      console.error('Registration error:', err);
      let msg = err.message || 'Đăng ký không thành công. Vui lòng thử lại.';
      if (msg.includes('User already registered')) {
        msg = 'Email này đã được sử dụng bởi một tài khoản khác.';
      }
      errorAlert.textContent = msg;
      errorAlert.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Đăng ký tài khoản';
      btnSpinner.style.display = 'none';
    }
  });
});
