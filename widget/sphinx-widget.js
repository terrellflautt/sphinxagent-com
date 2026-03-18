(function() {
  'use strict';

  var script = document.currentScript;
  var agentId = script.getAttribute('data-agent-id');
  var color = script.getAttribute('data-color') || '#D4AF37';
  var position = script.getAttribute('data-position') || 'bottom-right';
  var greeting = script.getAttribute('data-greeting') || 'Hello! How can I help you?';
  var enableVoice = script.getAttribute('data-voice') !== 'false'; // voice on by default
  var API = 'https://dgyr0dzn4k.execute-api.us-east-1.amazonaws.com/production';

  if (!agentId) { return; }

  var isOpen = false;
  var conversationId = null;
  var sessionKey = 'sphinx_widget_' + agentId;
  var isListening = false;
  var recognition = null;

  // Check browser speech support
  var hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  var hasSpeechSynthesis = !!window.speechSynthesis;

  // Restore conversation from sessionStorage
  try {
    var saved = sessionStorage.getItem(sessionKey);
    if (saved) {
      var parsed = JSON.parse(saved);
      conversationId = parsed.conversationId;
    }
  } catch(e) {}

  // Styles
  var css = document.createElement('style');
  css.textContent = [
    '.sphinx-widget-container{position:fixed;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.5;}',
    '.sphinx-widget-container *{box-sizing:border-box;margin:0;padding:0;}',
    position === 'bottom-left'
      ? '.sphinx-widget-container{bottom:20px;left:20px;}'
      : '.sphinx-widget-container{bottom:20px;right:20px;}',
    '.sphinx-bubble{width:56px;height:56px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.2);transition:transform 0.2s;margin-left:auto;}',
    '.sphinx-bubble:hover{transform:scale(1.1);}',
    '.sphinx-bubble svg{width:24px;height:24px;fill:white;}',
    '.sphinx-panel{width:360px;max-width:calc(100vw - 40px);height:500px;max-height:calc(100vh - 100px);background:white;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15);overflow:hidden;display:none;flex-direction:column;margin-bottom:12px;}',
    '.sphinx-panel.open{display:flex;}',
    '.sphinx-header{padding:16px;color:white;display:flex;justify-content:space-between;align-items:center;}',
    '.sphinx-header h3{font-size:15px;font-weight:600;}',
    '.sphinx-close{background:none;border:none;color:rgba(255,255,255,0.8);cursor:pointer;font-size:18px;padding:4px;}',
    '.sphinx-close:hover{color:white;}',
    '.sphinx-messages{flex:1;overflow-y:auto;padding:12px;background:#f9fafb;}',
    '.sphinx-msg{margin-bottom:10px;max-width:85%;}',
    '.sphinx-msg.bot{text-align:left;}',
    '.sphinx-msg.user{text-align:right;margin-left:auto;}',
    '.sphinx-msg span{display:inline-block;padding:8px 12px;border-radius:12px;font-size:13px;word-wrap:break-word;white-space:pre-wrap;}',
    '.sphinx-msg.bot span{background:#e5e7eb;color:#1f2937;border-bottom-left-radius:4px;}',
    '.sphinx-msg.user span{color:white;border-bottom-right-radius:4px;}',
    '.sphinx-typing span{background:#e5e7eb;color:#9ca3af;animation:sphinx-pulse 1.5s infinite;}',
    '@keyframes sphinx-pulse{0%,100%{opacity:0.6;}50%{opacity:1;}}',
    '.sphinx-input-area{padding:8px 12px;border-top:1px solid #e5e7eb;display:flex;gap:6px;background:white;align-items:center;}',
    '.sphinx-input{flex:1;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;font-size:13px;outline:none;font-family:inherit;}',
    '.sphinx-input:focus{border-color:' + color + ';box-shadow:0 0 0 2px ' + color + '33;}',
    '.sphinx-send,.sphinx-mic,.sphinx-speak{border:none;border-radius:8px;padding:8px;color:white;cursor:pointer;font-size:13px;font-weight:500;font-family:inherit;display:flex;align-items:center;justify-content:center;min-width:36px;height:36px;}',
    '.sphinx-send{padding:8px 14px;}',
    '.sphinx-send:disabled,.sphinx-mic:disabled{opacity:0.5;cursor:not-allowed;}',
    '.sphinx-mic.listening{animation:sphinx-mic-pulse 1s ease-in-out infinite;}',
    '@keyframes sphinx-mic-pulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.4);}50%{box-shadow:0 0 0 8px rgba(220,38,38,0);}}',
    '.sphinx-speak{background:transparent;color:#9ca3af;padding:2px;min-width:24px;height:24px;}',
    '.sphinx-speak:hover{color:' + color + ';}',
    '.sphinx-speak.active{color:' + color + ';}',
    '.sphinx-powered{text-align:center;padding:4px;font-size:10px;color:#9ca3af;background:white;}',
    '.sphinx-powered a{color:#D4AF37;text-decoration:none;}'
  ].join('\n');
  document.head.appendChild(css);

  // Container
  var container = document.createElement('div');
  container.className = 'sphinx-widget-container';

  // Build input area with optional voice buttons
  var micBtn = '';
  if (enableVoice && hasSpeechRecognition) {
    micBtn = '<button class="sphinx-mic" id="sphinx-mic" style="background:' + color + '" title="Voice input" aria-label="Voice input">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>' +
      '</button>';
  }

  // Panel
  var panel = document.createElement('div');
  panel.className = 'sphinx-panel';
  panel.innerHTML = [
    '<div class="sphinx-header" style="background:' + color + '">',
    '  <h3>Chat with us</h3>',
    '  <button class="sphinx-close" onclick="this.closest(\'.sphinx-panel\').classList.remove(\'open\')">&times;</button>',
    '</div>',
    '<div class="sphinx-messages" id="sphinx-messages"></div>',
    '<div class="sphinx-input-area">',
    '  <input class="sphinx-input" id="sphinx-input" placeholder="Type a message..." autocomplete="off">',
    micBtn,
    '  <button class="sphinx-send" id="sphinx-send" style="background:' + color + '">Send</button>',
    '</div>',
    '<div class="sphinx-powered">Powered by <a href="https://sphinxagent.ai" target="_blank">Sphinx Agent</a></div>'
  ].join('');

  // Bubble
  var bubble = document.createElement('div');
  bubble.className = 'sphinx-bubble';
  bubble.style.backgroundColor = color;
  bubble.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';

  container.appendChild(panel);
  container.appendChild(bubble);
  document.body.appendChild(container);

  // Event handlers
  bubble.addEventListener('click', function() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('open');
      var msgs = panel.querySelector('#sphinx-messages');
      if (msgs.children.length === 0) {
        addMessage(greeting, 'bot');
      }
      panel.querySelector('#sphinx-input').focus();
    } else {
      panel.classList.remove('open');
    }
  });

  panel.querySelector('.sphinx-close').addEventListener('click', function() {
    isOpen = false;
    panel.classList.remove('open');
  });

  var input = panel.querySelector('#sphinx-input');
  var sendBtn = panel.querySelector('#sphinx-send');

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Voice input (Speech-to-Text) via Web Speech API
  var micBtnEl = panel.querySelector('#sphinx-mic');
  if (micBtnEl && hasSpeechRecognition) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = document.documentElement.lang || 'en-US';

    recognition.onresult = function(event) {
      var transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        input.value = transcript;
        sendMessage();
      }
    };

    recognition.onstart = function() {
      isListening = true;
      micBtnEl.classList.add('listening');
      micBtnEl.style.backgroundColor = '#dc2626';
      input.placeholder = 'Listening...';
    };

    recognition.onend = function() {
      isListening = false;
      micBtnEl.classList.remove('listening');
      micBtnEl.style.backgroundColor = color;
      input.placeholder = 'Type a message...';
    };

    recognition.onerror = function() {
      isListening = false;
      micBtnEl.classList.remove('listening');
      micBtnEl.style.backgroundColor = color;
      input.placeholder = 'Type a message...';
    };

    micBtnEl.addEventListener('click', function() {
      if (isListening) {
        recognition.stop();
      } else {
        // Detect language from recent messages
        try {
          var msgs = panel.querySelector('#sphinx-messages');
          var lastBot = msgs.querySelectorAll('.sphinx-msg.bot span');
          if (lastBot.length > 0) {
            var lastText = lastBot[lastBot.length - 1].textContent || '';
            // Simple Spanish detection
            if (/[áéíóúñ¿¡]/.test(lastText) || /\b(hola|gracias|por favor|cómo)\b/i.test(lastText)) {
              recognition.lang = 'es-ES';
            } else {
              recognition.lang = 'en-US';
            }
          }
        } catch(e) {}
        recognition.start();
      }
    });
  }

  // Text-to-Speech for bot responses
  function speakText(text) {
    if (!hasSpeechSynthesis || !enableVoice) return;
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    // Try to detect language
    if (/[áéíóúñ¿¡]/.test(text) || /\b(hola|gracias|por favor|cómo)\b/i.test(text)) {
      utterance.lang = 'es-ES';
    } else {
      utterance.lang = 'en-US';
    }
    window.speechSynthesis.speak(utterance);
  }

  function addMessage(text, role) {
    var msgs = panel.querySelector('#sphinx-messages');
    var div = document.createElement('div');
    div.className = 'sphinx-msg ' + role;

    var span = document.createElement('span');
    if (role === 'user') span.style.backgroundColor = color;
    span.textContent = text;
    div.appendChild(span);

    // Add speaker button for bot messages (voice enabled)
    if (role === 'bot' && enableVoice && hasSpeechSynthesis) {
      var speakBtn = document.createElement('button');
      speakBtn.className = 'sphinx-speak';
      speakBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
      speakBtn.title = 'Listen';
      speakBtn.setAttribute('aria-label', 'Listen to this message');
      speakBtn.addEventListener('click', function() {
        speakText(text);
        speakBtn.classList.add('active');
        setTimeout(function() { speakBtn.classList.remove('active'); }, 2000);
      });
      div.appendChild(speakBtn);
    }

    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function showTyping() {
    var msgs = panel.querySelector('#sphinx-messages');
    var div = document.createElement('div');
    div.className = 'sphinx-msg bot sphinx-typing';
    div.id = 'sphinx-typing';
    var span = document.createElement('span');
    span.textContent = 'Thinking...';
    div.appendChild(span);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    var el = document.getElementById('sphinx-typing');
    if (el) el.remove();
  }

  async function sendMessage() {
    var text = input.value.trim();
    if (!text) return;

    input.value = '';
    sendBtn.disabled = true;
    if (micBtnEl) micBtnEl.disabled = true;
    addMessage(text, 'user');
    showTyping();

    try {
      var res = await fetch(API + '/widget/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentId,
          message: text,
          conversationId: conversationId
        })
      });
      var data = await res.json();
      removeTyping();

      if (res.ok) {
        conversationId = data.conversationId;
        addMessage(data.response, 'bot');
        try {
          sessionStorage.setItem(sessionKey, JSON.stringify({ conversationId: conversationId }));
        } catch(e) {}
      } else {
        addMessage(data.error || 'Something went wrong. Please try again.', 'bot');
      }
    } catch(e) {
      removeTyping();
      addMessage('Connection error. Please try again.', 'bot');
    }

    sendBtn.disabled = false;
    if (micBtnEl) micBtnEl.disabled = false;
    input.focus();
  }
})();
