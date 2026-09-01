function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';
  if (host.startsWith('www.')) {
    var apex = host.replace('www.', '');
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: 'https://' + apex + request.uri } }
    };
  }
  var uri = request.uri;
  // The Think Tank hub is served at / . The legacy /blog/ index is a duplicate
  // of it, so send it to the canonical URL with a real 301.
  if (uri === '/blog' || uri === '/blog/' || uri === '/blog/index.html') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: 'https://sphinxagent.com/' } }
    };
  }
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }
  return request;
}
