const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export function getApiBase(): string {
  return API_BASE || '';
}

export function adminUrl(path: string): string {
  const base = getApiBase();
  return base ? `${base}/api/admin/${path}` : `/api/admin/${path}`;
}

export async function adminFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = adminUrl(path);
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
