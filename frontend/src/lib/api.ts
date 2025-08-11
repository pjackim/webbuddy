import { safeFetch, handleApiError } from './error-store.svelte.js';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
export const WS_BASE = (import.meta.env.VITE_WS_BASE || 'ws://localhost:8000') + '/ws';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const url = `${API_BASE}${path}`;
	try {
		const res = await safeFetch(url, {
			headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
			...init
		});
		return res.json();
	} catch (error) {
		// Error already handled by safeFetch, just re-throw
		throw error;
	}
}

export async function uploadFile(file: File): Promise<{ url: string }> {
	const form = new FormData();
	form.append('file', file);
	const url = `${API_BASE}/assets/upload`;
	
	try {
		const res = await safeFetch(url, { method: 'POST', body: form });
		return res.json();
	} catch (error) {
		// Error already handled by safeFetch, just re-throw
		throw error;
	}
}
