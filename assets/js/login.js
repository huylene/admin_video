/**
 * Login Page Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();

  // If already authenticated, redirect to dashboard
  await window.guards.redirectIfAuthenticated();

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const errorAlert = document.getElementById('auth-error-alert');

  // Quick fill demo buttons
  document.getElementById('fill-admin-btn').addEventListener('click', () => {
    emailInput.value = 'admin1@gmail.com';
    passwordInput.value = '123456';
    errorAlert.style.display = 'none';
  });

  document.getElementById('fill-user-btn').addEventListener('click', () => {
    emailInput.value = 'user1@gmail.com';
    passwordInput.value = '123456';
    errorAlert.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorAlert.style.display = 'none';

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      errorAlert.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu.';
      errorAlert.style.display = 'block';
      return;
    }

    // Set loading
    submitBtn.disabled = true;
    btnText.textContent = 'Đang xác thực...';
    btnSpinner.style.display = 'inline-block';

    try {
      if (!window.APP_CONFIG.isConfigured()) {
        window.UI.showConfigModal();
        throw new Error('Bạn cần nhập Supabase Project URL và Anon Key trước khi đăng nhập.');
      }

      await window.auth.signIn(email, password);

      window.UI.showToast('Đăng nhập thành công! Đang chuyển hướng...', 'success');
      
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');
      
      setTimeout(() => {
        window.location.href = returnUrl ? decodeURIComponent(returnUrl) : 'dashboard.html';
      }, 600);
    } catch (err) {
      console.error('Login error:', err);
      let msg = err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Email hoặc mật khẩu không chính xác.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Tài khoản chưa được kích hoạt email trong Supabase.';
      } else if (msg.toLowerCase().includes('invalid api key') || msg.includes('apiKey')) {
        msg = 'Khóa API Key không hợp lệ! Bạn đang dùng Database Password thay vì Supabase Anon Key. Vui lòng vào Supabase Dashboard > Project Settings > API > copy khóa "anon public" và cấu hình lại.';
      }
      errorAlert.innerHTML = `
        <div>${msg}</div>
        ${msg.includes('API') || msg.includes('Khóa') ? '<button type="button" class="btn btn-outline btn-sm" style="margin-top: 8px; width: 100%; font-size: 12px; background: white;" onclick="window.UI.showConfigModal()">Nhập lại Supabase Anon Key</button>' : ''}
      `;
      errorAlert.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Đăng nhập';
      btnSpinner.style.display = 'none';
    }
  });
});
