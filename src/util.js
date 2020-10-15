export function dumpQuery(query) {
  return Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export function request({
  method = 'GET',
  url,
  params,
  responseType,
  data,
  headers,
}) {
  return new Promise((resolve, reject) => {
    if (params) {
      const sep = url.includes('?') ? '&' : '?';
      url += sep + dumpQuery(params);
    }
    GM_xmlhttpRequest({
      method,
      url,
      responseType,
      data,
      headers,
      onload(res) {
        if (res.status >= 300) return reject();
        resolve(res.response);
      },
      onerror: reject,
    });
  });
}
