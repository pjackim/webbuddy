<script lang="ts">
	import * as Code from '$lib/components/ui/code/index.js';
	import { cn } from '$lib/utils';

	interface Props {
		/** The error code (e.g., 500, 404, 403) */
		errorCode: number | string;
		/** The error message, logs, or Error object to display */
		errorMessage: string | Error;
		/** Additional error details or stack trace */
		errorDetails?: string;
		/** Language for syntax highlighting (default: 'typescript') */
		language?: 'bash' | 'diff' | 'javascript' | 'json' | 'svelte' | 'typescript';
		/** Whether to show the copy button */
		showCopyButton?: boolean;
		/** Whether to start collapsed (for overflow) */
		startCollapsed?: boolean;
		/** Custom title instead of "Internal Error" */
		title?: string;
		/** Additional CSS classes */
		class?: string;
	}

	let {
		errorCode,
		errorMessage,
		errorDetails,
		language = 'typescript',
		showCopyButton = true,
		startCollapsed = true,
		title,
		class: className
	}: Props = $props();

	// Enhanced error content processing with better formatting
	const combinedErrorContent = $derived.by(() => {
		try {
			let messageText = '';
			let stackText = '';
			let additionalInfo = [];
			
			// Handle Error objects with enhanced processing
			if (errorMessage instanceof Error) {
				messageText = `${errorMessage.name}: ${errorMessage.message}`;
				stackText = errorMessage.stack || '';
				
				// Add error properties if available
				const errorProps = Object.getOwnPropertyNames(errorMessage).filter(
					prop => !['name', 'message', 'stack'].includes(prop)
				);
				
				for (const prop of errorProps) {
					const value = (errorMessage as any)[prop];
					if (value !== undefined && value !== null) {
						additionalInfo.push(`${prop}: ${JSON.stringify(value)}`);
					}
				}
				
				// Clean up stack trace
				if (stackText.startsWith(messageText)) {
					stackText = stackText.substring(messageText.length + 1);
				}
				
				// Remove duplicate error lines from stack
				stackText = stackText.split('\n')
					.filter(line => line.trim() && !line.includes('at Error '))
					.join('\n');
				
			} else if (typeof errorMessage === 'object' && errorMessage !== null) {
				// Handle API responses and other objects
				try {
					// Check if it looks like an API error response
					const obj = errorMessage as any;
					if (obj.error || obj.message || obj.status) {
						messageText = obj.error || obj.message || 'Unknown error';
						if (obj.status) additionalInfo.push(`Status: ${obj.status}`);
						if (obj.code) additionalInfo.push(`Code: ${obj.code}`);
						if (obj.timestamp) additionalInfo.push(`Time: ${obj.timestamp}`);
						if (obj.path) additionalInfo.push(`Path: ${obj.path}`);
					} else {
						messageText = JSON.stringify(errorMessage, null, 2);
					}
				} catch (jsonError) {
					messageText = String(errorMessage);
					additionalInfo.push(`JSON Parse Error: ${jsonError}`);
				}
			} else {
				messageText = String(errorMessage || 'Unknown error occurred');
			}
			
			// Process additional details
			if (errorDetails) {
				// Try to parse as JSON if it looks like structured data
				try {
					if (errorDetails.startsWith('{') || errorDetails.startsWith('[')) {
						const parsed = JSON.parse(errorDetails);
						stackText = JSON.stringify(parsed, null, 2);
					} else {
						stackText = stackText ? `${stackText}\n\n${errorDetails}` : errorDetails;
					}
				} catch {
					stackText = stackText ? `${stackText}\n\n${errorDetails}` : errorDetails;
				}
			}
			
			// Combine all parts with proper formatting
			const parts = [messageText];
			
			if (additionalInfo.length > 0) {
				parts.push('\n--- Error Properties ---');
				parts.push(additionalInfo.join('\n'));
			}
			
			if (stackText && stackText.trim()) {
				parts.push('\n--- Stack Trace ---');
				parts.push(stackText.trim());
			}
			
			return parts.join('\n');
			
		} catch (processingError) {
			// Fallback in case of processing errors
			console.error('Error processing error content:', processingError);
			return `Error processing failed: ${String(errorMessage)}\n\nProcessing Error: ${processingError}`;
		}
	});

	// Enhanced title generation with more HTTP codes and custom handling
	const displayTitle = $derived.by(() => {
		if (title) return title;
		
		const code = String(errorCode).toUpperCase();
		
		// Handle HTTP status codes
		if (typeof errorCode === 'number' || /^\d+$/.test(code)) {
			const numericCode = Number(errorCode);
			switch (numericCode) {
				// 4xx Client Errors
				case 400: return 'Bad Request';
				case 401: return 'Unauthorized';
				case 402: return 'Payment Required';
				case 403: return 'Forbidden';
				case 404: return 'Not Found';
				case 405: return 'Method Not Allowed';
				case 408: return 'Request Timeout';
				case 409: return 'Conflict';
				case 410: return 'Gone';
				case 422: return 'Unprocessable Entity';
				case 429: return 'Too Many Requests';
				
				// 5xx Server Errors
				case 500: return 'Internal Server Error';
				case 501: return 'Not Implemented';
				case 502: return 'Bad Gateway';
				case 503: return 'Service Unavailable';
				case 504: return 'Gateway Timeout';
				case 505: return 'HTTP Version Not Supported';
				
				// Generic ranges
				default:
					if (numericCode >= 400 && numericCode < 500) return 'Client Error';
					if (numericCode >= 500 && numericCode < 600) return 'Server Error';
					return 'Error';
			}
		}
		
		// Handle custom error codes
		switch (code) {
			case 'JS': return 'JavaScript Error';
			case 'VALIDATION': return 'Validation Error';
			case 'NETWORK': case 'CONN': return 'Network Error';
			case 'TIMEOUT': return 'Timeout Error';
			case 'PERMISSION': return 'Permission Error';
			default:
				if (code.startsWith('LIVE-')) {
					return `Live ${code.substring(5)} Error`;
				}
				return 'Application Error';
		}
	});
	
	// Determine appropriate styling based on error type
	const errorSeverity = $derived.by(() => {
		const code = Number(errorCode);
		if (code >= 500) return 'critical';
		if (code >= 400) return 'warning';
		if (String(errorCode).includes('JS') || String(errorCode).includes('LIVE')) return 'info';
		return 'default';
	});
	
	// Get appropriate color classes based on severity
	const severityClasses = $derived.by(() => {
		switch (errorSeverity) {
			case 'critical': return 'text-red-500';
			case 'warning': return 'text-yellow-600';
			case 'info': return 'text-blue-600';
			default: return 'text-foreground';
		}
	});
</script>

<div class={cn('flex flex-col items-center justify-center min-h-[400px] p-8 border rounded-lg', severityClasses, className)}>
	<!-- Error Code Display -->
	<div class="text-center mb-8">
		<h1 class="text-8xl font-bold text-foreground mb-2">
			{errorCode}
		</h1>
		<h2 class="text-2xl font-medium text-muted-foreground">
			{displayTitle}
		</h2>
	</div>

	<!-- Error Logs/Message Display -->
	<div class="w-full max-w-4xl">
		<Code.Overflow collapsed={startCollapsed}>
			<Code.Root
				code={combinedErrorContent}
				lang={language}
				variant="default"
				class="relative max-h-[600px]"
			>
				{#if showCopyButton}
					<div class="absolute right-2 top-2">
						<Code.CopyButton variant="ghost" size="icon" />
					</div>
				{/if}
			</Code.Root>
		</Code.Overflow>
	</div>
</div>
