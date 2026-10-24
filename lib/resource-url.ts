import { isWdc } from './site-brand';
/** Firebase Hosting serves the WDC frontend; both editions share the public resource API. */
export function resourceUrl(value: string): string {
  if (!isWdc) return value;
  let path = value.startsWith('/') && !value.startsWith('//') ? value : '';
  if (!path && typeof window !== 'undefined') {
    try { const url = new URL(value); if (url.origin === window.location.origin) path = url.pathname + url.search + url.hash; } catch {}
  }
  if (path.startsWith('/api/') || /^\/vault\/(physics|chemistry|math)-topicals\//.test(path)) return `https://ibstuff28.vercel.app${path}`;
  return value;
}
export function studyFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  if (typeof input === 'string') return fetch(resourceUrl(input), init);
  if (input instanceof URL && typeof window !== 'undefined' && input.origin === window.location.origin) return fetch(resourceUrl(input.pathname + input.search), init);
  return fetch(input, init);
}
