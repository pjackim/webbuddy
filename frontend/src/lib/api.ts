export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
export const WS_BASE = (import.meta.env.VITE_WS_BASE || 'ws://localhost:8000') + '/ws';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadFile(file: File): Promise<{ url: string }>{
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/assets/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
