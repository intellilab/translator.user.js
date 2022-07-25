export function request<T>({
  method = 'GET',
  url,
  params,
  responseType,
  data,
  headers,
}: {
  method?: string;
  url: string;
  params?: Record<string, string>;
  responseType?: 'text' | 'json';
  data?: unknown;
  headers?: Record<string, string>;
}) {
  return new Promise<T>((resolve, reject) => {
    if (params) {
      const sep = url.includes('?') ? '&' : '?';
      url += sep + new URLSearchParams(params).toString();
    }
    GM_xmlhttpRequest({
      method,
      url,
      responseType,
      data,
      headers,
      onload(res: XMLHttpRequest) {
        if (res.status >= 300) return reject();
        resolve(res.response as T);
      },
      onerror: reject,
    });
  });
}
