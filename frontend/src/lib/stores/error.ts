import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';
import { writable, type Writable } from 'svelte/store';

export type ErrorInfo = {
	code: number | string;
	message: string | Error;
	details?: string;
	timestamp: Date;
	url?: string;
	stack?: string;
};

export type ErrorState = {
	currentError: ErrorInfo | null;
	errorHistory: ErrorInfo[];
};

// Global error state
const _errorStore: Writable<ErrorState> = writable({ currentError: null, errorHistory: [] });
let _snapshot: ErrorState = { currentError: null, errorHistory: [] };
_errorStore.subscribe((v) => (_snapshot = v));
export const errorStore = {
	get currentError() { return _snapshot.currentError; },
	set currentError(val: ErrorInfo | null) { _errorStore.update((s) => ({ ...s, currentError: val })); },
	get errorHistory() { return _snapshot.errorHistory; },
	set errorHistory(val: ErrorInfo[]) { _errorStore.update((s) => ({ ...s, errorHistory: val })); }
};

// Error handling functions
export function handleError(error: ErrorInfo) {
	console.error('Application Error:', error);

	// Add to history
	errorStore.errorHistory.unshift(error);

	// Keep only last 10 errors in history
	if (errorStore.errorHistory.length > 10) {
		errorStore.errorHistory = errorStore.errorHistory.slice(0, 10);
	}

	// Set as current error for display
	errorStore.currentError = error;

	// For serious errors, navigate to error page
	if (isSeriousError(error.code)) {
		navigateToErrorPage(error);
	} else {
		// For minor errors, show toast
		showErrorToast(error);
	}
}

export function clearError() {
	errorStore.currentError = null;
}

export function clearAllErrors() {
	errorStore.currentError = null;
	errorStore.errorHistory = [];
}

function navigateToErrorPage(error: ErrorInfo) {
	// Encode error data to pass to error page
	const errorData = encodeURIComponent(
		JSON.stringify({
			code: error.code,
			message:
				error.message instanceof Error
					? {
							name: error.message.name,
							message: error.message.message,
							stack: error.message.stack
						}
					: error.message,
			details: error.details,
			timestamp: error.timestamp.toISOString(),
			url: error.url
		})
	);

	// Navigate to dedicated error page
	goto(`/error?data=${errorData}`);
}

function showErrorToast(error: ErrorInfo) {
	const message = error.message instanceof Error ? error.message.message : String(error.message);
	toast.error(message, {
		description: error.details,
		duration: 5000
	});
}

// Helper to create error info from different sources
export function createErrorInfo(
	code: number | string,
	message: string | Error,
	details?: string,
	url?: string
): ErrorInfo {
	let stack: string | undefined;
	let errorMessage: string | Error = message;

	if (message instanceof Error) {
		stack = message.stack;
		errorMessage = message;
	}

	return {
		code,
		message: errorMessage,
		details,
		timestamp: new Date(),
		url,
		stack
	};
}

// Get available API routes for 404 error messages
function getAvailableRoutes(): string {
	return `Available routes:

Screens:
- GET /api/screens
- POST /api/screens
- PUT /api/screens/{screen_id}
- DELETE /api/screens/{screen_id}

Assets:
- GET /api/assets
- POST /api/assets
- PUT /api/assets/{asset_id}
- DELETE /api/assets/{asset_id}
- POST /api/assets/upload

Other:
- GET /health
- WebSocket: /ws`;
}

// Extract endpoint from URL for better error messages
function extractEndpoint(url: string): string {
	try {
		const urlObj = new URL(url);
		return urlObj.pathname;
	} catch {
		return url;
	}
}

// API error handler
export function handleApiError(error: any, url?: string) {
	let code: number | string = 500;
	let message: string = 'Unknown API error';
	let details: string | undefined;

	if (error instanceof Response) {
		code = error.status;

		if (code === 404 && url) {
			const endpoint = extractEndpoint(url);
			message = `Route not found: ${endpoint}`;
			details = `\n${getAvailableRoutes()}`;
		} else {
			message = `HTTP ${error.status}: ${error.statusText}`;
			details = `Request to ${error.url} failed`;
		}
	} else if (error instanceof Error) {
		if (error.message.includes('Failed to fetch')) {
			code = 'NETWORK';
			message = 'Network connection failed';
			details = 'Unable to connect to the server. Please check your internet connection.';
		} else {
			message = error.message;
			details = error.stack;
		}
	} else if (typeof error === 'string') {
		message = error;
	}

	const errorInfo = createErrorInfo(code, message, details, url);

	// Handle errors appropriately
	handleError(errorInfo);

	return errorInfo;
}

// Fetch wrapper with error handling
export async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
	try {
		const response = await fetch(url, options);

		if (!response.ok) {
			// Create a more detailed error response for API errors
			const errorResponse = response.clone();
			// Response.url is read-only; pass url via param instead
			handleApiError(errorResponse, url);
			throw errorResponse;
		}

		return response;
	} catch (error) {
		// For network errors or other exceptions
		if (!(error instanceof Response)) {
			handleApiError(error, url);
		}
		throw error;
	}
}

// Check if error should show full error page (vs just toast)
export function isSeriousError(code: number | string): boolean {
	if (typeof code === 'number') {
		return code >= 400; // 4xx and 5xx errors
	}
	// Only JavaScript and custom errors get full pages, network errors get toasts
	return ['JS', 'CUSTOM', 'LIVE'].includes(String(code));
}
