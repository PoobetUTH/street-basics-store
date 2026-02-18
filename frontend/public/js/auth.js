// ============================================
// Auth Page Logic — Decoupled Frontend
// ============================================

// API Base URL — points to the backend service
const API_BASE = window.__API_BASE__ || 'http://localhost:4000';

// Check if already logged in
(function checkAuth() {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'shop.html';
  }
})();

// Switch between Login and Register tabs
function switchTab(tab) {
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (tab === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  } else {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  }
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  btn.disabled = true;
  btn.innerHTML = '<span class="btn-loading"></span>';

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'เกิดข้อผิดพลาด');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showToast('เข้าสู่ระบบสำเร็จ! ✅', 'success');

    setTimeout(() => {
      window.location.href = 'shop.html';
    }, 1000);
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
    btn.innerHTML = '<span>เข้าสู่ระบบ</span>';
  }
}

// Handle Register
async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('registerBtn');
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  btn.disabled = true;
  btn.innerHTML = '<span class="btn-loading"></span>';

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'เกิดข้อผิดพลาด');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showToast('สมัครสมาชิกสำเร็จ! 🎉', 'success');

    setTimeout(() => {
      window.location.href = 'shop.html';
    }, 1000);
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
    btn.innerHTML = '<span>สมัครสมาชิก</span>';
  }
}

// Toast notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast-message ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
