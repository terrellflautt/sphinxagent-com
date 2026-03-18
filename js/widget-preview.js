(function() {
  'use strict';

  if (!window.SphinxAuth.requireLogin()) return;

  const params = new URLSearchParams(window.location.search);
  const agentId = params.get('id');

  if (!agentId) {
    window.location.href = '/dashboard.html';
    return;
  }

  async function init() {
    try {
      const data = await window.SphinxAPI.getAgent(agentId);
      const agent = data.agent;

      document.getElementById('agent-name').textContent = agent.name;

      const color = agent.color || '#4F46E5';
      document.getElementById('widget-color').value = color;
      updatePreview(color);
      generateCode(agentId, color);
    } catch (err) {
      alert('Failed to load agent: ' + err.message);
    }
  }

  function updatePreview(color) {
    const bubble = document.getElementById('preview-bubble');
    const header = document.getElementById('preview-header');
    if (bubble) bubble.style.backgroundColor = color;
    if (header) header.style.backgroundColor = color;
  }

  function generateCode(id, color) {
    const code = `<script src="https://sphinxagent.ai/widget/sphinx-widget.js" data-agent-id="${id}" data-color="${color}"><\/script>`;
    document.getElementById('embed-code').textContent = code;
  }

  window.updateWidgetColor = function(color) {
    updatePreview(color);
    generateCode(agentId, color);
  };

  window.copyEmbedCode = function() {
    const code = document.getElementById('embed-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy Code'; }, 2000);
    });
  };

  init();
})();
