<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { handleError, createErrorInfo } from '$lib/error-store.svelte.js';
	import { api } from '$lib/api.js';
	
	// Test functions for different error scenarios
	async function test404Error() {
		try {
			await api('/nonexistent-endpoint');
		} catch (error) {
			// Error already handled by safeFetch in api.js
		}
	}
	
	async function test500Error() {
		try {
			// Simulate a 500 error by calling an endpoint that should return 500
			await fetch('/api/simulate-500', { method: 'POST' });
		} catch (error) {
			// Create and handle a 500 error manually for demo
			const errorInfo = createErrorInfo(
				500,
				'Internal Server Error',
				'Database connection failed\\n\\nStack trace:\\n  at DatabaseConnector.connect (db.ts:45:12)\\n  at UserService.getUser (service.ts:23:8)\\n  at async /api/users/123',
				window.location.href
			);
			handleError(errorInfo);
		}
	}
	
	function testJavaScriptError() {
		// Create a real JavaScript error with stack trace
		try {
			// @ts-ignore - intentionally cause an error
			nonexistentFunction();
		} catch (error) {
			const errorInfo = createErrorInfo('JS', error, 'This error was intentionally triggered for testing', window.location.href);
			handleError(errorInfo);
		}
	}
	
	function testNetworkError() {
		const errorInfo = createErrorInfo(
			'NETWORK',
			'Network connection failed',
			'Unable to connect to the server. Please check your internet connection.\\n\\nRequest Details:\\n- URL: /api/users\\n- Method: GET\\n- Timeout: 30s',
			window.location.href
		);
		handleError(errorInfo);
	}
	
	function testCustomError() {
		const error = new Error('Custom application error');
		error.stack = `Error: Custom application error
    at testCustomError (/demo/error-testing:45:18)
    at HTMLButtonElement.onclick (/demo/error-testing:89:25)
    at EventListener.handleEvent (dom.ts:12:3)`;
		
		const errorInfo = createErrorInfo(
			'CUSTOM',
			error,
			'Additional context: This error occurred during user interaction',
			window.location.href
		);
		handleError(errorInfo);
	}
	
	function testThrowError() {
		// This will be caught by the global error handler
		throw new Error('Uncaught error for global handler testing');
	}
	
	async function testPromiseRejection() {
		// This will be caught by the unhandledrejection handler
		Promise.reject(new Error('Unhandled promise rejection test'));
	}
</script>

<svelte:head>
	<title>Error Testing - WebBuddy</title>
</svelte:head>

<div class="container mx-auto p-8 max-w-4xl">
	<h1 class="text-3xl font-bold mb-8">Error Testing Dashboard</h1>
	<p class="text-muted-foreground mb-8">
		Test various error scenarios to see the error panel in action. Each button simulates different types of errors.
	</p>
	
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- HTTP Errors -->
		<Card>
			<CardHeader>
				<CardTitle>HTTP Errors</CardTitle>
				<CardDescription>Test different HTTP status codes</CardDescription>
			</CardHeader>
			<CardContent class="space-y-3">
				<Button class="w-full" variant="destructive" on:click={test404Error}>
					Test 404 - Not Found
				</Button>
				<Button class="w-full" variant="destructive" on:click={test500Error}>
					Test 500 - Internal Server Error
				</Button>
			</CardContent>
		</Card>
		
		<!-- JavaScript Errors -->
		<Card>
			<CardHeader>
				<CardTitle>JavaScript Errors</CardTitle>
				<CardDescription>Test runtime JavaScript errors</CardDescription>
			</CardHeader>
			<CardContent class="space-y-3">
				<Button class="w-full" variant="destructive" on:click={testJavaScriptError}>
					Test JavaScript Error
				</Button>
				<Button class="w-full" variant="destructive" on:click={testThrowError}>
					Test Uncaught Error
				</Button>
				<Button class="w-full" variant="destructive" on:click={testPromiseRejection}>
					Test Promise Rejection
				</Button>
			</CardContent>
		</Card>
		
		<!-- Network Errors -->
		<Card>
			<CardHeader>
				<CardTitle>Network Errors</CardTitle>
				<CardDescription>Test connection and network-related errors</CardDescription>
			</CardHeader>
			<CardContent class="space-y-3">
				<Button class="w-full" variant="destructive" on:click={testNetworkError}>
					Test Network Error
				</Button>
			</CardContent>
		</Card>
		
		<!-- Custom Errors -->
		<Card>
			<CardHeader>
				<CardTitle>Custom Errors</CardTitle>
				<CardDescription>Test custom application errors</CardDescription>
			</CardHeader>
			<CardContent class="space-y-3">
				<Button class="w-full" variant="destructive" on:click={testCustomError}>
					Test Custom Error
				</Button>
			</CardContent>
		</Card>
	</div>
	
	<!-- Instructions -->
	<Card class="mt-8">
		<CardHeader>
			<CardTitle>How It Works</CardTitle>
		</CardHeader>
		<CardContent>
			<ul class="space-y-2 text-sm text-muted-foreground">
				<li>• <strong>HTTP Errors (404, 500):</strong> Automatically detected from API calls and show the error modal</li>
				<li>• <strong>JavaScript Errors:</strong> Caught and displayed with full stack traces</li>
				<li>• <strong>Network Errors:</strong> Connection failures and timeouts trigger error panels</li>
				<li>• <strong>Global Handlers:</strong> Uncaught errors and unhandled promise rejections are captured</li>
				<li>• <strong>404 Pages:</strong> Try visiting a non-existent URL like <code>/nonexistent-page</code></li>
			</ul>
		</CardContent>
	</Card>
</div>