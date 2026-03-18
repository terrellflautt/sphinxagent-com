(function() {
  'use strict';

  const api = window.SphinxAuth.apiCall;

  // Agents
  async function createAgent(data) {
    return api('/agents', { method: 'POST', body: JSON.stringify(data) });
  }

  async function listAgents() {
    return api('/agents');
  }

  async function getAgent(id) {
    return api(`/agents/${id}`);
  }

  async function updateAgent(id, data) {
    return api(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async function deleteAgent(id) {
    return api(`/agents/${id}`, { method: 'DELETE' });
  }

  // Chat
  async function chat(agentId, message, conversationId) {
    return api(`/agents/${agentId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, conversationId })
    });
  }

  // Usage
  async function getUsage() {
    return api('/usage');
  }

  // Billing
  async function getBillingPortal() {
    return api('/billing/portal');
  }

  window.SphinxAPI = {
    createAgent, listAgents, getAgent, updateAgent, deleteAgent,
    chat, getUsage, getBillingPortal
  };
})();
