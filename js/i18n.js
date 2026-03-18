(function() {
  'use strict';

  var translations = {
    // Navigation
    'nav.home': { en: 'Home', es: 'Inicio' },
    'nav.features': { en: 'Features', es: 'Funciones' },
    'nav.howItWorks': { en: 'How It Works', es: 'Cómo Funciona' },
    'nav.pricing': { en: 'Pricing', es: 'Precios' },
    'nav.docs': { en: 'Documentation', es: 'Documentación' },
    'nav.dashboard': { en: 'Dashboard', es: 'Panel' },
    'nav.analytics': { en: 'Analytics', es: 'Analíticas' },
    'nav.signIn': { en: 'Sign In', es: 'Iniciar Sesión' },
    'nav.logout': { en: 'Logout', es: 'Cerrar Sesión' },

    // Pricing
    'pricing.title': { en: 'Choose Your Plan', es: 'Elige Tu Plan' },
    'pricing.subtitle': { en: 'Upgrade or downgrade anytime. All plans include a 7-day trial.', es: 'Mejora o reduce tu plan en cualquier momento. Todos incluyen 7 días de prueba.' },
    'pricing.monthly': { en: 'Monthly', es: 'Mensual' },
    'pricing.yearly': { en: 'Yearly (Save 17%)', es: 'Anual (Ahorra 17%)' },
    'pricing.free': { en: 'Free', es: 'Gratis' },
    'pricing.starter': { en: 'Starter', es: 'Inicial' },
    'pricing.pro': { en: 'Pro', es: 'Pro' },
    'pricing.business': { en: 'Business', es: 'Empresarial' },
    'pricing.subscribe': { en: 'Subscribe', es: 'Suscribirse' },
    'pricing.manageBilling': { en: 'Manage Billing', es: 'Gestionar Facturación' },
    'pricing.agents': { en: 'agents', es: 'agentes' },
    'pricing.agent': { en: 'agent', es: 'agente' },
    'pricing.messagesPerMonth': { en: 'messages/mo', es: 'mensajes/mes' },
    'pricing.unlimitedAgents': { en: 'Unlimited agents', es: 'Agentes ilimitados' },
    'pricing.unlimitedMessages': { en: 'Unlimited messages', es: 'Mensajes ilimitados' },
    'pricing.embeddableWidget': { en: 'Embeddable widget', es: 'Widget integrable' },
    'pricing.whiteLabel': { en: 'White-label support', es: 'Soporte marca blanca' },
    'pricing.currentTier': { en: 'Current Free Tier', es: 'Plan Gratuito Actual' },

    // Dashboard
    'dashboard.title': { en: 'Your Agents', es: 'Tus Agentes' },
    'dashboard.newAgent': { en: 'New Agent', es: 'Nuevo Agente' },
    'dashboard.noAgents': { en: 'No agents yet. Create your first one!', es: '¡Aún no tienes agentes. Crea el primero!' },
    'dashboard.testChat': { en: 'Test Chat', es: 'Chat de Prueba' },
    'dashboard.edit': { en: 'Edit', es: 'Editar' },
    'dashboard.delete': { en: 'Delete', es: 'Eliminar' },
    'dashboard.usage': { en: 'Usage', es: 'Uso' },
    'dashboard.send': { en: 'Send', es: 'Enviar' },

    // Agent Wizard
    'wizard.createAgent': { en: 'Create Agent', es: 'Crear Agente' },
    'wizard.editAgent': { en: 'Edit Agent', es: 'Editar Agente' },
    'wizard.agentName': { en: 'Agent Name', es: 'Nombre del Agente' },
    'wizard.businessName': { en: 'Business Name', es: 'Nombre del Negocio' },
    'wizard.industry': { en: 'Industry', es: 'Industria' },
    'wizard.description': { en: 'Business Description', es: 'Descripción del Negocio' },
    'wizard.instructions': { en: 'Instructions', es: 'Instrucciones' },
    'wizard.greeting': { en: 'Greeting Message', es: 'Mensaje de Bienvenida' },
    'wizard.cancel': { en: 'Cancel', es: 'Cancelar' },
    'wizard.save': { en: 'Save', es: 'Guardar' },

    // Analytics
    'analytics.title': { en: 'Analytics', es: 'Analíticas' },
    'analytics.conversations': { en: 'Conversations', es: 'Conversaciones' },
    'analytics.messages': { en: 'Messages', es: 'Mensajes' },
    'analytics.agents': { en: 'Agents', es: 'Agentes' },
    'analytics.upgrade': { en: 'Upgrade', es: 'Mejorar Plan' },

    // Footer
    'footer.product': { en: 'Product', es: 'Producto' },
    'footer.snapitSuite': { en: 'SnapIT Suite', es: 'Suite SnapIT' },
    'footer.legal': { en: 'Legal', es: 'Legal' },
    'footer.privacy': { en: 'Privacy Policy', es: 'Política de Privacidad' },
    'footer.terms': { en: 'Terms of Service', es: 'Términos de Servicio' },
    'footer.doNotSell': { en: 'Do Not Sell My Info', es: 'No Vender Mi Información' },
    'footer.copyright': { en: '© 2026 SnapIT Software. All rights reserved.', es: '© 2026 SnapIT Software. Todos los derechos reservados.' },
    'footer.tagline': { en: 'AI-powered customer service chatbots for every business.', es: 'Chatbots de atención al cliente con IA para cada negocio.' },

    // Cookie Banner
    'cookie.message': { en: 'We use localStorage for authentication. No tracking cookies are used.', es: 'Usamos localStorage para autenticación. No usamos cookies de rastreo.' },
    'cookie.agree': { en: 'By continuing, you agree to our', es: 'Al continuar, aceptas nuestra' },
    'cookie.gotIt': { en: 'Got It', es: 'Entendido' },

    // Common
    'common.loading': { en: 'Loading...', es: 'Cargando...' },
    'common.error': { en: 'An error occurred', es: 'Ocurrió un error' },
    'common.backToDashboard': { en: 'Back to Dashboard', es: 'Volver al Panel' },
    'common.contact': { en: 'Contact', es: 'Contacto' },
    'common.support': { en: 'Support', es: 'Soporte' },
    'common.feedback': { en: 'Feedback', es: 'Comentarios' },

    // Widget Generator
    'widgetGen.title': { en: 'Widget Generator', es: 'Generador de Widget' },
    'widgetGen.selectAgent': { en: 'Select Agent', es: 'Seleccionar Agente' },
    'widgetGen.color': { en: 'Widget Color', es: 'Color del Widget' },
    'widgetGen.copyCode': { en: 'Copy Code', es: 'Copiar Código' },
    'widgetGen.copied': { en: 'Copied!', es: '¡Copiado!' },
    'widgetGen.preview': { en: 'Preview', es: 'Vista Previa' },

    // Legal pages
    'legal.lastUpdated': { en: 'Last Updated', es: 'Última Actualización' },
    'legal.contactUs': { en: 'Contact Us', es: 'Contáctenos' },
  };

  function getLang() {
    return localStorage.getItem('sphinx_lang') || 'en';
  }

  function setLang(lang) {
    localStorage.setItem('sphinx_lang', lang);
    applyTranslations();
    document.documentElement.lang = lang;
    updateToggleButton();
  }

  function t(key) {
    var lang = getLang();
    var entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
  }

  function applyTranslations() {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-i18n');
      var text = t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    }
    // Also apply to data-i18n-title for aria-labels / tooltips
    var titled = document.querySelectorAll('[data-i18n-title]');
    for (var j = 0; j < titled.length; j++) {
      titled[j].title = t(titled[j].getAttribute('data-i18n-title'));
    }
  }

  function createToggleButton() {
    var btn = document.createElement('button');
    btn.id = 'lang-toggle';
    btn.setAttribute('aria-label', 'Toggle language / Cambiar idioma');
    btn.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid #d1d5db;background:transparent;color:inherit;transition:all .2s;';
    btn.addEventListener('mouseenter', function() { btn.style.borderColor = '#D4AF37'; });
    btn.addEventListener('mouseleave', function() { btn.style.borderColor = '#d1d5db'; });
    btn.addEventListener('click', function() {
      setLang(getLang() === 'en' ? 'es' : 'en');
    });
    updateToggleButtonEl(btn);
    return btn;
  }

  function updateToggleButtonEl(btn) {
    var lang = getLang();
    btn.innerHTML = lang === 'en' ? '🌐 ES' : '🌐 EN';
  }

  function updateToggleButton() {
    var btn = document.getElementById('lang-toggle');
    if (btn) updateToggleButtonEl(btn);
  }

  function injectToggle() {
    // Find the nav's right-side container and insert toggle before dark mode button
    var navRight = document.querySelector('nav .flex.items-center.space-x-4') ||
                   document.querySelector('nav .flex.items-center');
    if (navRight) {
      var existing = document.getElementById('lang-toggle');
      if (!existing) {
        var toggle = createToggleButton();
        // Insert as first child of the right nav area
        navRight.insertBefore(toggle, navRight.firstChild);
      }
    }
  }

  // Initialize
  function init() {
    document.documentElement.lang = getLang();
    injectToggle();
    applyTranslations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose globally
  window.SnapI18n = { t: t, setLang: setLang, getLang: getLang, applyTranslations: applyTranslations };
})();
