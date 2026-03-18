(function() {
  'use strict';

  // One-time migration from SnapIT → Sphinx localStorage keys
  ['token','user','jwt_token','ref','lang'].forEach(function(k) {
    var old = localStorage.getItem('snapit_' + k);
    if (old && !localStorage.getItem('sphinx_' + k)) {
      localStorage.setItem('sphinx_' + k, old);
      localStorage.removeItem('snapit_' + k);
    }
  });

  const API_BASE = 'https://dgyr0dzn4k.execute-api.us-east-1.amazonaws.com/production';
  const GOOGLE_CLIENT_ID = '242648112266-sgu8npql6nem6hfa3feputkooq6of151.apps.googleusercontent.com';
  const TOKEN_KEY = 'sphinx_token';
  const USER_KEY = 'sphinx_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch { return null; }
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('sphinx_jwt_token');
    localStorage.removeItem(USER_KEY);
    window.location.href = '/';
  }

  async function handleGoogleCredential(response) {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential, referralCode: localStorage.getItem('sphinx_ref') || undefined })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem('sphinx_jwt_token', data.token); // backward compat for legacy pages
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        window.location.href = '/dashboard.html';
      } else {
        alert('Login failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Login failed. Please try again.');
    }
  }

  function loginWithGoogle() {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false
    });
    google.accounts.id.prompt();
  }

  async function verifyToken() {
    const token = getToken();
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        logout();
        return false;
      }
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return true;
      }
      logout();
      return false;
    } catch {
      return false;
    }
  }

  async function apiCall(path, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (res.status === 401) {
      logout();
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  }

  async function checkout(tier, interval) {
    try {
      const data = await apiCall('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ tier, interval })
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert('Checkout failed: ' + err.message);
    }
  }

  function requireLogin() {
    if (!isLoggedIn()) {
      window.location.href = '/';
      return false;
    }
    return true;
  }

  window.SphinxAuth = {
    getToken, getUser, isLoggedIn, logout, loginWithGoogle,
    verifyToken, apiCall, checkout, requireLogin, API_BASE
  };
})();
