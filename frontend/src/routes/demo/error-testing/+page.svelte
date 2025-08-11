<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { handleError, createErrorInfo } from '$lib/error-store.svelte.js';
	import { api } from '$lib/api.js';
	
	// Test functions for different error scenarios
	// Generate random endpoint for testing
	function generateRandomEndpoint(): string {
		const prefixes = ['users', 'posts', 'comments', 'products', 'orders', 'files', 'data'];
		const actions = ['create', 'update', 'delete', 'export', 'import', 'sync'];
		const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
		const action = actions[Math.floor(Math.random() * actions.length)];
		const id = Math.floor(Math.random() * 1000);
		return `/${prefix}/${action}/${id}`;
	}

	async function test404RandomEndpoint() {
		const randomEndpoint = generateRandomEndpoint();
		try {
			await api(randomEndpoint);
		} catch (error) {
			// Error already handled by safeFetch - will show the attempted endpoint
			console.log('Random 404 error handled:', error);
		}
	}
	
	async function test404TypicalEndpoints() {
		const commonEndpoints = ['/users', '/posts/123', '/admin/dashboard', '/api/v2/data', '/files/upload'];
		const endpoint = commonEndpoints[Math.floor(Math.random() * commonEndpoints.length)];
		try {
			await api(endpoint);
		} catch (error) {
			// Error already handled by safeFetch
			console.log('Typical 404 error handled:', error);
		}
	}
	
	async function test404DeepNestedPath() {
		const deepPath = '/api/v1/organizations/123/projects/456/tasks/789/comments/edit';
		try {
			await api(deepPath);
		} catch (error) {
			// Error already handled by safeFetch
			console.log('Deep nested 404 error handled:', error);
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
	
	function testMinorNetworkError() {
		// This will show as a toast instead of redirecting to error page
		const errorInfo = createErrorInfo(
			'NETWORK',
			'Connection timeout',
			'The request took too long to complete.',
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
	
	// Custom endpoint testing
	let customEndpoint = $state('/users/123');
	
	async function testCustomEndpoint() {
		if (!customEndpoint.trim()) {
			customEndpoint = '/example/endpoint';
		}
		try {
			await api(customEndpoint);
		} catch (error) {
			// Error already handled by safeFetch - will show whatever endpoint was attempted
			console.log('Custom 404 error handled for:', customEndpoint);
		}
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
				<Button class="w-full" variant="destructive" on:click={test404RandomEndpoint}>
					Test 404 - Random Endpoint
				</Button>
				<Button class="w-full" variant="destructive" on:click={test404TypicalEndpoints}>
					Test 404 - Typical API Call
				</Button>
				<Button class="w-full" variant="destructive" on:click={test404DeepNestedPath}>
					Test 404 - Deep Nested Path
				</Button>
				<Button class="w-full" variant="destructive" on:click={test500Error}>
					Test 500 - Internal Server Error
				</Button>
				
				<div class="pt-4 border-t">
					<label class="text-xs font-medium" for="custom-endpoint">Test Custom Endpoint:</label>
					<div class="flex gap-2 mt-2">
						<input 
							id="custom-endpoint"
							type="text" 
							class="flex-1 px-3 py-2 text-sm border rounded-md" 
							placeholder="/any/endpoint/you/want"
							bind:value={customEndpoint}
						/>
						<Button variant="destructive" size="sm" on:click={testCustomEndpoint}>
							Test
						</Button>
					</div>
					<p class="text-xs text-muted-foreground mt-1">Try any endpoint like /users/123, /admin, /api/v2/data, etc.</p>
				</div>
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
				<Button class="w-full" variant="outline" on:click={testMinorNetworkError}>
					Test Network Toast
				</Button>
				<p class="text-xs text-muted-foreground">Shows toast notification</p>
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
				<li>• <strong>HTTP 404 Errors:</strong> Show attempted endpoint and list of available API routes</li>
				<li>• <strong>HTTP 500 Errors:</strong> Redirect to full-page error displays</li>
				<li>• <strong>JavaScript Errors:</strong> Redirect to dedicated error pages with full stack traces</li>
				<li>• <strong>Network Errors:</strong> Show toast notifications (not full pages)</li>
				<li>• <strong>Global Handlers:</strong> Uncaught errors redirect to error pages</li>
				<li>• <strong>404 Pages:</strong> Try visiting a non-existent URL like <code>/nonexistent-page</code></li>
			</ul>
		</CardContent>
	</Card>
</div>