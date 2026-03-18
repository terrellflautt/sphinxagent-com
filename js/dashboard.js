(function() {
  'use strict';

  if (!window.SphinxAuth.requireLogin()) return;

  const user = window.SphinxAuth.getUser();

  async function init() {
    await window.SphinxAuth.verifyToken();
    renderUserInfo();
    renderReferral();
    await Promise.all([loadAgents(), loadUsage()]);
  }

  function renderReferral() {
    var refCode = user.refCode || (user.userId ? user.userId.replace('google_', '').slice(0, 12) : '');
    var refLink = 'https://sphinxagent.ai/?ref=' + refCode;
    var el = document.getElementById('referral-link');
    if (el) el.textContent = refLink;

    var statsEl = document.getElementById('referral-stats');
    if (statsEl) {
      var count = user.referralCount || 0;
      var pending = user.pendingReferralCredits || 0;
      statsEl.innerHTML =
        '<span class="text-amber-300 font-semibold">' + count + ' referral' + (count !== 1 ? 's' : '') + '</span>' +
        (pending > 0 ? ' <span class="text-slate-400">|</span> <span class="text-green-300 font-semibold">' + pending + ' free month' + (pending !== 1 ? 's' : '') + ' pending</span>' : '') +
        (count > 0 ? ' <span class="text-slate-400">|</span> <span class="text-slate-300">Free months earned: ' + count + '+</span>' : '');
    }
  }

  window.copyReferral = function() {
    var link = document.getElementById('referral-link').textContent;
    navigator.clipboard.writeText(link).then(function() {
      var btn = document.getElementById('referral-copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
    });
  };

  function renderUserInfo() {
    const el = document.getElementById('user-info');
    if (el) {
      el.innerHTML = `
        <div class="flex items-center space-x-3">
          ${user.picture ? `<img src="${user.picture}" alt="" class="w-8 h-8 rounded-full">` : ''}
          <span class="font-medium">${escapeHtml(user.name || user.email)}</span>
          <span class="text-xs px-2 py-1 bg-amber-100 dark:bg-pink-900/30 text-amber-700 dark:text-amber-300 rounded-full uppercase">${user.plan || 'free'}</span>
        </div>
      `;
    }

    // Render account info panel
    const acctEl = document.getElementById('account-info');
    if (acctEl) {
      const shortId = user.userId ? user.userId.replace('google_', '') : '';
      acctEl.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center gap-4">
              ${user.picture ? `<img src="${user.picture}" alt="" class="w-14 h-14 rounded-full border-2 border-amber-200 dark:border-amber-800">` : '<div class="w-14 h-14 rounded-full bg-amber-100 dark:bg-pink-900/30 flex items-center justify-center text-amber-600 text-xl font-bold">' + (user.name ? user.name[0] : '?') + '</div>'}
              <div>
                <h2 class="font-bold text-lg">${escapeHtml(user.name || 'User')}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">${escapeHtml(user.email || '')}</p>
              </div>
            </div>
            <div class="flex flex-col sm:items-end gap-1">
              <span class="text-xs px-3 py-1 bg-amber-100 dark:bg-pink-900/30 text-amber-700 dark:text-amber-300 rounded-full uppercase font-semibold inline-block w-fit">${user.plan || 'free'} plan</span>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs text-gray-400 dark:text-gray-500">User ID:</span>
                <code class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono select-all">${escapeHtml(user.userId || '')}</code>
                <button onclick="navigator.clipboard.writeText('${escapeHtml(user.userId || '')}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)" class="text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 font-medium">Copy</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  async function loadAgents() {
    const container = document.getElementById('agents-list');
    if (!container) return;

    try {
      const data = await window.SphinxAPI.listAgents();
      const agents = data.agents || [];

      if (agents.length === 0) {
        container.innerHTML = `
          <div class="col-span-full text-center py-16">
            <div class="text-5xl mb-4">&#129302;</div>
            <h3 class="text-lg font-semibold mb-2 dark:text-white">No agents yet</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">Create your first AI agent in under 2 minutes.</p>
            <a href="agent-wizard.html" class="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition font-semibold">Create Your First Agent</a>
          </div>
        `;
        return;
      }

      container.innerHTML = agents.map(agent => {
        const agentColor = agent.color || '#D4AF37';
        const widgetUrl = 'https://sphinxagent.ai/widget/sphinx-widget.js';
        const embedCode = '<script src="' + widgetUrl + '" data-agent-id="' + agent.id + '" data-color="' + agentColor + '"><\\/script>';
        const shareLink = 'https://sphinxagent.ai/chat/' + agent.id;

        return `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style="background:${agentColor}">
                ${escapeHtml(agent.name ? agent.name[0] : 'A')}
              </div>
              <div>
                <h3 class="font-semibold text-lg dark:text-white">${escapeHtml(agent.name)}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">${escapeHtml(agent.industry || 'General')} &middot; ${agent.model}</p>
              </div>
            </div>
          </div>

          <!-- Agent Access Code -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Agent ID / Access Code</span>
              <button onclick="navigator.clipboard.writeText('${agent.id}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)" class="text-xs text-amber-600 dark:text-amber-400 font-medium hover:text-amber-800">Copy</button>
            </div>
            <code class="text-xs font-mono text-gray-700 dark:text-gray-300 select-all break-all">${agent.id}</code>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
            <span>${agent.messageCount || 0} messages</span>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-2">
            <a href="agent-wizard.html?id=${agent.id}" class="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-300 hover:text-amber-600 transition">Edit</a>
            <a href="widget-generator.html?id=${agent.id}" class="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-300 hover:text-amber-600 transition">Widget Code</a>
            <button onclick="testChat('${agent.id}')" class="text-sm px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition">Test Chat</button>
            <button onclick="confirmDelete('${agent.id}','${escapeHtml(agent.name)}')" class="text-sm px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">Delete</button>
          </div>
        </div>
      `;
      }).join('');
    } catch (err) {
      container.innerHTML = `<p class="text-red-500">Failed to load agents: ${escapeHtml(err.message)}</p>`;
    }
  }

  async function loadUsage() {
    const container = document.getElementById('usage-info');
    if (!container) return;

    try {
      const data = await window.SphinxAPI.getUsage();
      const pct = data.usage.percentage;
      const barColor = pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-green-500';
      const isUnlimited = data.usage.limit === -1;

      container.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex-1">
              <h3 class="font-semibold mb-2 dark:text-white">Usage This Month</h3>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600 dark:text-gray-400">Messages</span>
                <span class="font-medium dark:text-gray-300">${data.usage.messages} / ${isUnlimited ? 'Unlimited' : data.usage.limit}</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div class="${barColor} rounded-full h-2.5 transition-all" style="width: ${isUnlimited ? 0 : Math.min(pct, 100)}%"></div>
              </div>
              ${pct > 80 && !isUnlimited ? '<p class="text-xs text-red-500 mt-1">Approaching limit — consider upgrading.</p>' : ''}
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500 dark:text-gray-400">Plan: <strong class="text-gray-900 dark:text-white uppercase">${data.tierName}</strong></span>
              ${data.plan !== 'business' ? '<a href="pricing.html" class="text-sm bg-amber-600 text-white px-4 py-1.5 rounded-lg hover:bg-amber-700 transition font-medium">Upgrade</a>' : ''}
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p class="text-red-500 text-sm">Failed to load usage</p>`;
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  window.confirmDelete = async function(id, name) {
    if (!confirm('Delete agent "' + name + '"? This cannot be undone.')) return;
    try {
      await window.SphinxAPI.deleteAgent(id);
      await loadAgents();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  window.testChat = function(agentId) {
    const modal = document.getElementById('chat-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.dataset.agentId = agentId;
      modal.dataset.conversationId = '';
      document.getElementById('chat-messages').innerHTML = '';
      document.getElementById('chat-input').value = '';
      document.getElementById('chat-input').focus();
    }
  };

  window.closeChatModal = function() {
    document.getElementById('chat-modal').classList.add('hidden');
  };

  window.sendTestMessage = async function() {
    const modal = document.getElementById('chat-modal');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    const message = input.value.trim();
    if (!message) return;

    const agentId = modal.dataset.agentId;
    const convId = modal.dataset.conversationId || '';

    // Show user message
    messages.innerHTML += '<div class="mb-3 text-right"><span class="inline-block bg-amber-600 text-white px-3 py-2 rounded-lg text-sm max-w-[80%] text-left">' + escapeHtml(message) + '</span></div>';
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Show typing indicator
    messages.innerHTML += '<div id="typing" class="mb-3"><span class="inline-block bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm text-gray-400">Typing...</span></div>';
    messages.scrollTop = messages.scrollHeight;

    try {
      const data = await window.SphinxAPI.chat(agentId, message, convId || undefined);
      modal.dataset.conversationId = data.conversationId;
      // Remove typing indicator
      const typing = document.getElementById('typing');
      if (typing) typing.remove();
      messages.innerHTML += '<div class="mb-3"><span class="inline-block bg-gray-100 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm max-w-[80%]">' + escapeHtml(data.response) + '</span></div>';
      messages.scrollTop = messages.scrollHeight;
    } catch (err) {
      const typing = document.getElementById('typing');
      if (typing) typing.remove();
      messages.innerHTML += '<div class="mb-3"><span class="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm">' + escapeHtml(err.message) + '</span></div>';
    }
  };

  init();
})();
