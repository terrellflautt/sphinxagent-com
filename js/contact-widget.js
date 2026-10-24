/**
 * Animal Brands Contact Widget v2.0
 * Self-contained drop-in contact/feedback/support/legal/privacy/sales widget
 * Usage: <script src="/contact-widget.js" data-app="App Name" data-accent="#f97316"></script>
 *
 * Forms: openContact(), openFeedback(), openSupport(), openLegal(), openPrivacy(), openSales()
 * Universal dispatcher: openEmailForm('support') → calls openSupport()
 */
(function () {
  'use strict';

  // --- Configuration ---
  var script = document.currentScript || document.querySelector('script[data-app]');
  var CONFIG = {
    appName: (script && script.getAttribute('data-app')) || window.location.hostname,
    accent: (script && script.getAttribute('data-accent')) || '#f97316',
    key: (script && script.getAttribute('data-key')) || '941dde05-6699-4793-b170-fb81b1659e32'
  };

  var PRODUCTS = [
    'HTTP Tiger', 'Status Tiger', 'URL Unicorn', 'QR Cheetah',
    'SnapIT Forms', 'Poll Pixie', 'Docs Dingo', 'Bolt Bunny',
    'DNS Dingo', 'IP Impala', 'WHOIS Wolf', 'Forum Fly',
    'Chatwit', 'Free Forms', 'ShortLinks', 'DynamicQR',
    'Free Polls', 'Is It Down', 'SnapIT Software', 'Nickel Pie', 'Other'
  ];

  var REQUEST_TYPES = [
    'Bug Report', 'Feature Request', 'Account Issue',
    'Billing Question', 'Technical Help', 'General Question', 'Other'
  ];

  // --- Helper: detect user info from localStorage ---
  function getUserInfo() {
    var userId = '';
    var accessKey = '';
    try {
      var sessionKeys = [
        CONFIG.appName.toLowerCase().replace(/\s+/g, '_') + '_session',
        'snapit_auth_token', 'polls_user', 'auth_session',
        'user_session', 'session', 'auth_token'
      ];
      for (var i = 0; i < sessionKeys.length; i++) {
        var val = localStorage.getItem(sessionKeys[i]);
        if (val) {
          try {
            var parsed = JSON.parse(val);
            userId = parsed.userId || parsed.user_id || parsed.email ||
              (parsed.user && (parsed.user.id || parsed.user.email)) || '';
            accessKey = parsed.accessKey || parsed.access_key ||
              (parsed.user && (parsed.user.accessKey || parsed.user.access_key)) || '';
          } catch (e) {
            userId = val;
          }
          if (userId) break;
        }
      }
      if (!accessKey) {
        accessKey = localStorage.getItem('accessKey') || localStorage.getItem('access_key') || '';
      }
    } catch (e) { /* localStorage unavailable */ }
    return { userId: userId, accessKey: accessKey };
  }

  // --- Inject CSS ---
  var style = document.createElement('style');
  style.textContent = [
    '.abw-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s}',
    '.abw-overlay.abw-open{opacity:1;visibility:visible}',
    '.abw-modal{background:#fff;border-radius:16px;box-shadow:0 25px 60px rgba(0,0,0,.3);max-width:560px;width:100%;max-height:90vh;overflow-y:auto;transform:translateY(20px) scale(.97);transition:transform .25s;position:relative;color:#1f2937}',
    '.abw-overlay.abw-open .abw-modal{transform:translateY(0) scale(1)}',
    '.abw-header{padding:24px 24px 0;display:flex;align-items:flex-start;justify-content:space-between}',
    '.abw-header h2{margin:0;font-size:22px;font-weight:700;color:#111827;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '.abw-header p{margin:6px 0 0;font-size:14px;color:#6b7280;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '.abw-close{position:absolute;top:16px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;color:#9ca3af;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:background .15s,color .15s;line-height:1}',
    '.abw-close:hover{background:#f3f4f6;color:#374151}',
    '.abw-form{padding:20px 24px 24px;display:flex;flex-direction:column;gap:16px}',
    '.abw-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
    '.abw-field{display:flex;flex-direction:column;gap:4px}',
    '.abw-field label{font-size:13px;font-weight:600;color:#374151;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '.abw-field input,.abw-field select,.abw-field textarea{padding:10px 12px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;color:#1f2937;background:#fff;transition:border-color .15s;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;outline:none;width:100%;box-sizing:border-box}',
    '.abw-field input:focus,.abw-field select:focus,.abw-field textarea:focus{border-color:' + CONFIG.accent + '}',
    '.abw-field textarea{resize:vertical;min-height:100px}',
    '.abw-field select{cursor:pointer;appearance:auto}',
    '.abw-phone{font-size:13px;color:#6b7280;text-align:center;padding:0;margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '.abw-phone a{color:' + CONFIG.accent + ';text-decoration:none;font-weight:500}',
    '.abw-phone a:hover{text-decoration:underline}',
    '.abw-submit{padding:12px 24px;border:none;border-radius:8px;font-size:15px;font-weight:600;color:#fff;cursor:pointer;transition:opacity .15s,transform .1s;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:' + CONFIG.accent + '}',
    '.abw-submit:hover{opacity:.9}',
    '.abw-submit:active{transform:scale(.98)}',
    '.abw-submit:disabled{opacity:.5;cursor:not-allowed;transform:none}',
    '.abw-success{text-align:center;padding:48px 24px}',
    '.abw-success-icon{font-size:48px;margin-bottom:12px}',
    '.abw-success h3{margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '.abw-success p{margin:0;font-size:14px;color:#6b7280;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '.abw-error{background:#fef2f2;color:#dc2626;padding:10px 14px;border-radius:8px;font-size:13px;text-align:center;display:none;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '@media(max-width:480px){.abw-modal{margin:8px;max-height:95vh;border-radius:12px}.abw-row{grid-template-columns:1fr}.abw-header h2{font-size:19px}.abw-form{padding:16px 18px 20px}}'
  ].join('\n');
  document.head.appendChild(style);

  // --- Build Overlay Container ---
  var overlay = document.createElement('div');
  overlay.className = 'abw-overlay';
  overlay.id = 'abw-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = '<div class="abw-modal" id="abw-modal"></div>';
  document.body.appendChild(overlay);

  var modalEl = document.getElementById('abw-modal');

  // --- Close Logic ---
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('abw-open')) closeModal();
  });

  function closeModal() {
    overlay.classList.remove('abw-open');
    document.body.style.overflow = '';
  }

  function openModal(html) {
    modalEl.innerHTML = html;
    overlay.classList.add('abw-open');
    document.body.style.overflow = 'hidden';
    var firstInput = modalEl.querySelector('input:not([type=hidden]),select,textarea');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 100);
  }

  // --- Close button HTML ---
  var closeBtn = '<button class="abw-close" onclick="document.getElementById(\'abw-overlay\').classList.remove(\'abw-open\');document.body.style.overflow=\'\'" aria-label="Close">&times;</button>';

  // --- Form Submission ---
  function handleSubmit(e, formType) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector('.abw-submit');
    var errEl = form.querySelector('.abw-error');
    var originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';
    if (errEl) errEl.style.display = 'none';

    var userInfo = getUserInfo();
    var fd = new FormData(form);
    fd.append('access_key', CONFIG.key);
    fd.append('from_name', CONFIG.appName + ' ' + formType);
    fd.append('App Name', CONFIG.appName);
    fd.append('Page URL', window.location.href);
    fd.append('Browser', navigator.userAgent);
    if (userInfo.userId) fd.append('User ID', userInfo.userId);
    if (userInfo.accessKey) fd.append('User Access Key', userInfo.accessKey);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: fd
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          var successHtml = '<div class="abw-success">' +
            '<div class="abw-success-icon">\u2705</div>' +
            '<h3>Message Sent!</h3>' +
            '<p>Thanks for reaching out. We\'ll get back to you soon.</p>' +
            '</div>';
          modalEl.querySelector('.abw-form').outerHTML = successHtml;
          setTimeout(closeModal, 4000);
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      })
      .catch(function (err) {
        if (errEl) {
          errEl.textContent = 'Something went wrong. Please try again.';
          errEl.style.display = 'block';
        }
        btn.disabled = false;
        btn.textContent = originalText;
      });
  }

  // --- Product <option> list ---
  function productOptions() {
    var html = '';
    for (var i = 0; i < PRODUCTS.length; i++) {
      var sel = (PRODUCTS[i] === CONFIG.appName) ? ' selected' : '';
      html += '<option value="' + PRODUCTS[i] + '"' + sel + '>' + PRODUCTS[i] + '</option>';
    }
    return html;
  }

  // --- Phone hint HTML ---
  var phoneHint = '<p class="abw-phone">Prefer to call? <a href="tel:+15126695734">(512) 669-5734</a></p>';

  // === CONTACT MODAL (info@) ===
  window.openContact = function () {
    openModal(
      '<div class="abw-header"><div><h2>Contact Us</h2><p>Have a question or need help? We\'d love to hear from you.</p></div>' + closeBtn + '</div>' +
      '<form class="abw-form" onsubmit="event.preventDefault()">' +
      '<input type="hidden" name="subject" value="Contact from ' + CONFIG.appName + '">' +
      '<div class="abw-field"><label>Name *</label><input type="text" name="name" required placeholder="Your name"></div>' +
      '<div class="abw-field"><label>Email *</label><input type="email" name="email" required placeholder="you@example.com"></div>' +
      '<div class="abw-field"><label>Message *</label><textarea name="message" required placeholder="How can we help?"></textarea></div>' +
      '<div class="abw-error"></div>' +
      phoneHint +
      '<button type="submit" class="abw-submit">Send Message</button>' +
      '</form>'
    );
    modalEl.querySelector('form').addEventListener('submit', function (e) { handleSubmit(e, 'Contact'); });
  };

  // === FEEDBACK MODAL (feedback@) ===
  window.openFeedback = function () {
    openModal(
      '<div class="abw-header"><div><h2>Send Feedback</h2><p>Your feedback helps us improve. Thanks for sharing!</p></div>' + closeBtn + '</div>' +
      '<form class="abw-form" onsubmit="event.preventDefault()">' +
      '<input type="hidden" name="subject" value="Feedback for ' + CONFIG.appName + '">' +
      '<div class="abw-field"><label>Email <span style="font-weight:400;color:#9ca3af">(optional)</span></label><input type="email" name="email" placeholder="you@example.com"></div>' +
      '<div class="abw-field"><label>Feedback Type *</label><select name="feedback_type" required>' +
      '<option value="">Select type...</option>' +
      '<option value="Bug Report">Bug Report</option>' +
      '<option value="Feature Request">Feature Request</option>' +
      '<option value="Improvement">Improvement</option>' +
      '<option value="Compliment">Compliment</option>' +
      '<option value="Other">Other</option>' +
      '</select></div>' +
      '<div class="abw-field"><label>Message *</label><textarea name="message" required placeholder="Tell us what you think..."></textarea></div>' +
      '<div class="abw-error"></div>' +
      '<button type="submit" class="abw-submit">Submit Feedback</button>' +
      '</form>'
    );
    modalEl.querySelector('form').addEventListener('submit', function (e) { handleSubmit(e, 'Feedback'); });
  };

  // === SUPPORT TICKET MODAL (support@) ===
  window.openSupport = function () {
    openModal(
      '<div class="abw-header"><div><h2>Submit Support Ticket</h2><p>Describe your issue and we\'ll get back to you promptly.</p></div>' + closeBtn + '</div>' +
      '<form class="abw-form" onsubmit="event.preventDefault()">' +
      '<input type="hidden" name="subject" value="Support Ticket from ' + CONFIG.appName + '">' +
      '<div class="abw-row">' +
      '<div class="abw-field"><label>Name *</label><input type="text" name="name" required placeholder="Your name"></div>' +
      '<div class="abw-field"><label>Email *</label><input type="email" name="email" required placeholder="you@example.com"></div>' +
      '</div>' +
      '<div class="abw-row">' +
      '<div class="abw-field"><label>Product *</label><select name="product" required>' + productOptions() + '</select></div>' +
      '<div class="abw-field"><label>Request Type *</label><select name="request_type" required>' +
      '<option value="">Select type...</option>' +
      REQUEST_TYPES.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('') +
      '</select></div>' +
      '</div>' +
      '<div class="abw-row">' +
      '<div class="abw-field"><label>Priority</label><select name="priority">' +
      '<option value="Low">Low</option>' +
      '<option value="Medium" selected>Medium</option>' +
      '<option value="High">High</option>' +
      '</select></div>' +
      '<div class="abw-field"><label>Subject *</label><input type="text" name="ticket_subject" required placeholder="Brief description"></div>' +
      '</div>' +
      '<div class="abw-field"><label>Message *</label><textarea name="message" required placeholder="Please describe your issue in detail..."></textarea></div>' +
      '<div class="abw-error"></div>' +
      phoneHint +
      '<button type="submit" class="abw-submit">Submit Ticket</button>' +
      '</form>'
    );
    modalEl.querySelector('form').addEventListener('submit', function (e) { handleSubmit(e, 'Support Ticket'); });
  };

  // === LEGAL MODAL (legal@) ===
  window.openLegal = function () {
    openModal(
      '<div class="abw-header"><div><h2>Legal Inquiry</h2><p>Submit a legal notice, DMCA request, or dispute.</p></div>' + closeBtn + '</div>' +
      '<form class="abw-form" onsubmit="event.preventDefault()">' +
      '<input type="hidden" name="subject" value="Legal Inquiry from ' + CONFIG.appName + '">' +
      '<div class="abw-row">' +
      '<div class="abw-field"><label>Name *</label><input type="text" name="name" required placeholder="Your full legal name"></div>' +
      '<div class="abw-field"><label>Email *</label><input type="email" name="email" required placeholder="you@example.com"></div>' +
      '</div>' +
      '<div class="abw-field"><label>Legal Matter Type *</label><select name="legal_type" required>' +
      '<option value="">Select type...</option>' +
      '<option value="DMCA Takedown">DMCA Takedown Request</option>' +
      '<option value="DMCA Counter-Notice">DMCA Counter-Notice</option>' +
      '<option value="Trademark Dispute">Trademark Dispute</option>' +
      '<option value="Terms Violation">Terms of Service Violation</option>' +
      '<option value="Legal Notice">General Legal Notice</option>' +
      '<option value="Other">Other</option>' +
      '</select></div>' +
      '<div class="abw-field"><label>Message *</label><textarea name="message" required placeholder="Please provide details of your legal matter, including any relevant URLs, dates, and documentation references."></textarea></div>' +
      '<div class="abw-error"></div>' +
      '<button type="submit" class="abw-submit">Submit Legal Inquiry</button>' +
      '</form>'
    );
    modalEl.querySelector('form').addEventListener('submit', function (e) { handleSubmit(e, 'Legal Inquiry'); });
  };

  // === PRIVACY / DATA RIGHTS MODAL (privacy@) ===
  window.openPrivacy = function () {
    openModal(
      '<div class="abw-header"><div><h2>Data Rights Request</h2><p>Exercise your privacy rights under GDPR, CCPA, and other regulations.</p></div>' + closeBtn + '</div>' +
      '<form class="abw-form" onsubmit="event.preventDefault()">' +
      '<input type="hidden" name="subject" value="Privacy/Data Rights Request from ' + CONFIG.appName + '">' +
      '<div class="abw-row">' +
      '<div class="abw-field"><label>Name *</label><input type="text" name="name" required placeholder="Your full name"></div>' +
      '<div class="abw-field"><label>Email *</label><input type="email" name="email" required placeholder="you@example.com"></div>' +
      '</div>' +
      '<div class="abw-field"><label>Request Type *</label><select name="privacy_request_type" required>' +
      '<option value="">Select your request...</option>' +
      '<option value="Delete My Data">Delete My Data (Right to Erasure)</option>' +
      '<option value="Access My Data">Access My Data (Data Portability)</option>' +
      '<option value="Export My Data">Export My Data</option>' +
      '<option value="Correct My Data">Correct My Data (Rectification)</option>' +
      '<option value="Opt-Out of Sale">Opt-Out of Data Sale (CCPA)</option>' +
      '<option value="Withdraw Consent">Withdraw Consent</option>' +
      '<option value="Data Processing Inquiry">Data Processing Inquiry</option>' +
      '<option value="Other">Other Privacy Request</option>' +
      '</select></div>' +
      '<div class="abw-field"><label>Account Email <span style="font-weight:400;color:#9ca3af">(if different from above)</span></label><input type="email" name="account_email" placeholder="Email associated with your account"></div>' +
      '<div class="abw-field"><label>Details *</label><textarea name="message" required placeholder="Please describe your request. Include any relevant account details to help us locate your data."></textarea></div>' +
      '<div class="abw-error"></div>' +
      '<p class="abw-phone">We respond to all data rights requests within 30 days.</p>' +
      '<button type="submit" class="abw-submit">Submit Data Request</button>' +
      '</form>'
    );
    modalEl.querySelector('form').addEventListener('submit', function (e) { handleSubmit(e, 'Privacy Request'); });
  };

  // === SALES MODAL (sales@) ===
  window.openSales = function () {
    openModal(
      '<div class="abw-header"><div><h2>Talk to Sales</h2><p>Interested in our products? Let\'s find the right plan for you.</p></div>' + closeBtn + '</div>' +
      '<form class="abw-form" onsubmit="event.preventDefault()">' +
      '<input type="hidden" name="subject" value="Sales Inquiry from ' + CONFIG.appName + '">' +
      '<div class="abw-row">' +
      '<div class="abw-field"><label>Name *</label><input type="text" name="name" required placeholder="Your name"></div>' +
      '<div class="abw-field"><label>Email *</label><input type="email" name="email" required placeholder="you@example.com"></div>' +
      '</div>' +
      '<div class="abw-row">' +
      '<div class="abw-field"><label>Company <span style="font-weight:400;color:#9ca3af">(optional)</span></label><input type="text" name="company" placeholder="Your company"></div>' +
      '<div class="abw-field"><label>Interest *</label><select name="interest" required>' +
      '<option value="">What brings you here?</option>' +
      '<option value="Pricing Question">Pricing Question</option>' +
      '<option value="Enterprise Plan">Enterprise Plan</option>' +
      '<option value="Partnership">Partnership Opportunity</option>' +
      '<option value="Custom Solution">Custom Solution</option>' +
      '<option value="Demo Request">Demo Request</option>' +
      '<option value="Other">Other</option>' +
      '</select></div>' +
      '</div>' +
      '<div class="abw-field"><label>Message *</label><textarea name="message" required placeholder="Tell us about your needs..."></textarea></div>' +
      '<div class="abw-error"></div>' +
      phoneHint +
      '<button type="submit" class="abw-submit">Contact Sales</button>' +
      '</form>'
    );
    modalEl.querySelector('form').addEventListener('submit', function (e) { handleSubmit(e, 'Sales Inquiry'); });
  };

  // === UNIVERSAL DISPATCHER ===
  window.openEmailForm = function (type) {
    var map = {
      'contact': window.openContact,
      'info': window.openContact,
      'feedback': window.openFeedback,
      'support': window.openSupport,
      'legal': window.openLegal,
      'privacy': window.openPrivacy,
      'sales': window.openSales
    };
    var fn = map[(type || '').toLowerCase()];
    if (fn) {
      fn();
    } else {
      window.openContact();
    }
  };

})();
