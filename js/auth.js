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

  const API_BASE = 'https://api.sphinxagent.ai';
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
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert('Login failed: ' + (errData.error || 'Server error'));
        return;
      }
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem('sphinx_jwt_token', data.token); // backward compat for legacy pages
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        closeSignInModal();

        // Check for pending checkout (user clicked a paid tier before signing in)
        const pendingCheckout = sessionStorage.getItem('sphinx_pending_checkout');
        if (pendingCheckout) {
          sessionStorage.removeItem('sphinx_pending_checkout');
          try {
            const pending = JSON.parse(pendingCheckout);
            checkout(pending.tier, pending.interval);
            return; // checkout() will redirect to Stripe
          } catch { /* fall through to dashboard */ }
        }
        window.location.href = '/dashboard.html';
      } else {
        alert('Login failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Login failed. Please try again.');
    }
  }

  function loginWithGoogle() {
    if (typeof google === 'undefined' || !google.accounts) {
      alert('Google Sign-In is still loading. Please try again in a moment.');
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false
    });

    // Show sign-in modal with a rendered Google button
    var hasPendingCheckout = !!sessionStorage.getItem('sphinx_pending_checkout');
    showSignInModal(hasPendingCheckout);
  }

  function showSignInModal(isCheckout) {
    var existing = document.getElementById('sphinx-signin-modal');
    if (existing) existing.remove();

    var isDark = document.documentElement.classList.contains('dark');
    var bg = isDark ? '#1f2937' : '#ffffff';
    var textColor = isDark ? '#f3f4f6' : '#111827';
    var subtextColor = isDark ? '#9ca3af' : '#6b7280';
    var closeBtnColor = isDark ? '#9ca3af' : '#666666';
    var subtitle = isCheckout
      ? 'Sign in with Google to complete your purchase'
      : 'Sign in with Google to get started';

    var overlay = document.createElement('div');
    overlay.id = 'sphinx-signin-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5)';
    overlay.innerHTML = '<div style="background:' + bg + ';border-radius:16px;padding:32px;max-width:400px;width:90%;text-align:center;position:relative">'
      + '<button onclick="document.getElementById(\'sphinx-signin-modal\').remove()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:20px;cursor:pointer;color:' + closeBtnColor + '">&times;</button>'
      + '<div style="width:48px;height:48px;border-radius:12px;background:#D4AF37;display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><span style="color:white;font-weight:bold;font-size:20px">S</span></div>'
      + '<h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:' + textColor + '">Sign in to continue</h2>'
      + '<p style="margin:0 0 24px;color:' + subtextColor + ';font-size:14px">' + subtitle + '</p>'
      + '<div id="sphinx-google-btn-container" style="display:flex;justify-content:center"></div>'
      + '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });

    google.accounts.id.renderButton(
      document.getElementById('sphinx-google-btn-container'),
      { theme: isDark ? 'filled_black' : 'outline', size: 'large', text: 'signin_with', width: 300 }
    );
  }

  function closeSignInModal() {
    var modal = document.getElementById('sphinx-signin-modal');
    if (modal) modal.remove();
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

  function savePendingAndLogin(tier, interval) {
    sessionStorage.setItem('sphinx_pending_checkout', JSON.stringify({ tier: tier, interval: interval }));
    loginWithGoogle();
  }

  async function checkout(tier, interval) {
    // No token — go straight to sign-in modal; checkout resumes after login.
    if (!getToken()) {
      savePendingAndLogin(tier, interval);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ tier, interval })
      });
      // Stale/expired token — silently clear it and re-prompt login.
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('sphinx_jwt_token');
        localStorage.removeItem(USER_KEY);
        savePendingAndLogin(tier, interval);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.url) window.location.href = data.url;
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
    verifyToken, apiCall, checkout, requireLogin, API_BASE,
    showSignInModal, closeSignInModal
  };
})();
