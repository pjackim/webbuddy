import type { PersistedState } from 'runed';

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
	isErrorModalOpen: boolean;
};

// Global error state
export const errorStore = $state<ErrorState>({
	currentError: null,
	errorHistory: [],
	isErrorModalOpen: false
});

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
	errorStore.isErrorModalOpen = true;
}

export function clearError() {
	errorStore.currentError = null;
	errorStore.isErrorModalOpen = false;
}

export function clearAllErrors() {
	errorStore.currentError = null;
	errorStore.errorHistory = [];
	errorStore.isErrorModalOpen = false;
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

// API error handler
export function handleApiError(error: any, url?: string) {
	let code = 500;
	let message = 'Unknown API error';
	let details: string | undefined;
	
	if (error instanceof Response) {
		code = error.status;
		message = `HTTP ${error.status}: ${error.statusText}`;
		details = `Request to ${error.url} failed`;
	} else if (error instanceof Error) {
		if (error.message.includes('Failed to fetch')) {
			code = 'NETWORK';
			message = 'Network connection failed';
			details = 'Unable to connect to the server. Please check your internet connection.';
		} else {
			message = error;
			details = error.stack;
		}
	} else if (typeof error === 'string') {
		message = error;
	}
	
	const errorInfo = createErrorInfo(code, message, details, url);
	
	// Only show error panel for serious errors
	if (typeof code === 'number' && (code >= 400)) {
		handleError(errorInfo);
	} else if (code === 'NETWORK') {
		handleError(errorInfo);
	}
	
	return errorInfo;
}

// Fetch wrapper with error handling
export async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
	try {
		const response = await fetch(url, options);
		
		if (!response.ok) {
			handleApiError(response, url);
			throw response;
		}
		
		return response;
	} catch (error) {
		handleApiError(error, url);
		throw error;
	}
}

// Check if error should show full error panel (vs just toast)
export function isSeriousError(code: number | string): boolean {
	if (typeof code === 'number') {
		return code >= 400; // 4xx and 5xx errors
	}
	return ['NETWORK', 'TIMEOUT', 'JS'].includes(String(code));
}