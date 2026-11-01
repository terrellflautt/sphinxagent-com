// Pages on sphinxagent.ai that exist as /<name>.html. Their extensionless URLs
// (/pricing, /faq/ ...) 301 to the .html page instead of 404ing.
var AI_PAGES = {
  'about': 1, 'agent-wizard': 1, 'ai-chatbot-for-small-business': 1, 'ai-chatbot-for-website': 1,
  'ai-phone-agent': 1, 'analytics': 1, 'chat': 1, 'chatbase-alternative': 1, 'contact': 1,
  'conversations': 1, 'cookie-policy': 1, 'customer-service-chatbot': 1, 'dashboard': 1,
  'do-not-sell': 1, 'docs': 1, 'drift-alternative': 1, 'faq': 1, 'free-ai-chatbot': 1,
  'intercom-alternative': 1, 'leads': 1, 'pricing': 1, 'privacy': 1, 'referral': 1,
  'support': 1, 'terms': 1, 'tickets': 1, 'tidio-alternative': 1, 'widget-generator': 1
};

// News articles that belong on the Think Tank (sphinxagent.com), not the product
// site. Old sphinxagent.ai URLs 301 there so shared links and search credit carry over.
var MOVED_TO_COM = {
  'binance-hack-2026': 1, 'php2shell-vulnerability': 1,
  'hardware-wallet-attacks-2026': 1, '90-days-without-power-fact-check': 1
};

function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';
  if (host.startsWith('www.')) {
    var apex = host.replace('www.', '');
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: 'https://' + apex + request.uri + buildQs(request.querystring) } }
    };
  }
  var uri = request.uri;
  // The Think Tank hub is served at / . The legacy /blog/ index is a duplicate
  // of it, so send it to the canonical URL with a real 301.
  if (uri === '/blog' || uri === '/blog/' || uri === '/blog/index.html') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: 'https://sphinxagent.com/' + buildQs(request.querystring) } }
    };
  }
  if (host.endsWith('sphinxagent.ai')) {
    var slug = uri.replace(/^\//, '').replace(/\/$/, '');
    var moved = slug.replace(/\.html$/, '');
    if (MOVED_TO_COM[moved] === 1) {
      return {
        statusCode: 301,
        statusDescription: 'Moved Permanently',
        headers: { location: { value: 'https://sphinxagent.com/blog/' + moved + '.html' + buildQs(request.querystring) } }
      };
    }
    if (AI_PAGES[slug] === 1) {
      return {
        statusCode: 301,
        statusDescription: 'Moved Permanently',
        headers: { location: { value: 'https://' + host + '/' + slug + '.html' + buildQs(request.querystring) } }
      };
    }
  }
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }
  return request;
}

// Query string for a redirect Location. CloudFront hands values over still
// percent-encoded, so they are passed through as-is (re-encoding would turn
// %20 into %2520); repeated keys keep every value.
function buildQs(q) {
    var parts = [];
    for (var k in q) {
        var vals = q[k].multiValue ? q[k].multiValue : [q[k]];
        vals.forEach(function (m) { parts.push(k + '=' + m.value); });
    }
    return parts.length ? '?' + parts.join('&') : '';
}
