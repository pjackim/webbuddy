<script lang="ts">
	import ErrorPanel from '$lib/components/ErrorPanelComplete.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { toast } from 'svelte-sonner';

	// Enhanced error generation with realistic scenarios
	function generateTestError(type: string = 'basic') {
		try {
			switch (type) {
				case 'network':
					throw new TypeError('Failed to fetch: ERR_NETWORK');
				case 'permission':
					throw new Error('Permission denied: Cannot access protected resource');
				case 'validation':
					throw new RangeError('Invalid input: Value must be between 1 and 100');
				case 'timeout':
					throw new Error('Request timeout: Operation took longer than 30 seconds');
				default:
					// Create a nested function call for meaningful stack trace
					function deepFunction() {
						function nestedFunction() {
							throw new Error('Test error with real stack trace');
						}
						return nestedFunction();
					}
					return deepFunction();
			}
		} catch (error) {
			return error;
		}
	}

	// Example error messages and logs
	const examples = [
		{
			code: 500,
			message: `const result = await fetch('/api/users');
if (!result.ok) {
	throw new Error('Failed to fetch users');
}`,
			details: `Stack trace:
Error: Failed to fetch users
    at fetchUsers (src/api/users.ts:12:3)
    at async UserList.svelte:23:18
    at async Promise.all (index 0)

Request Details:
- URL: /api/users
- Method: GET
- Status: 500
- Timestamp: 2024-01-15T10:30:45.123Z`,
			language: 'typescript' as const
		},
		{
			code: 404,
			message: `Route not found: /api/nonexistent-endpoint

Available routes:
- GET /api/users
- POST /api/users
- GET /api/screens
- POST /api/screens`,
			language: 'bash' as const
		},
		{
			code: 403,
			message: `{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource",
  "code": 403,
  "timestamp": "2024-01-15T10:30:45.123Z",
  "path": "/api/admin/users"
}`,
			language: 'json' as const
		},
		{
			code: 'JS',
			message: generateTestError(),
			details: 'This is a real JavaScript error with an actual stack trace generated at runtime.',
			language: 'javascript' as const
		},
		{
			code: 'VALIDATION',
			message: `ValidationError: Invalid form data

Errors found:
{
  "email": "Invalid email format",
  "password": "Password must be at least 8 characters",
  "confirmPassword": "Passwords do not match"
}`,
			details: 'Form validation failed on client-side before submission',
			language: 'json' as const
		},
		{
			code: 'CONN',
			message: generateTestError('network'),
			details: 'Network connectivity issue - check your internet connection',
			language: 'javascript' as const
		}
	];

	let currentExample = $state(0);
	let isGeneratingError = $state(false);
	let errorHistory = $state<Array<{ timestamp: Date; type: string; error: any }>>([]);

	// Enhanced error simulation with different types
	function triggerError(type: string = 'network') {
		if (isGeneratingError) return;
		
		isGeneratingError = true;
		try {
			const error = generateTestError(type);
			
			// Add to error history
			errorHistory.unshift({
				timestamp: new Date(),
				type,
				error
			});
			
			// Add this error as a new example
			const newExample = {
				code: `LIVE-${type.toUpperCase()}`,
				message: error,
				details: `This ${type} error was generated dynamically at ${new Date().toLocaleTimeString()}`,
				language: 'javascript' as const
			};
			examples.push(newExample);
			currentExample = examples.length - 1;
			
			toast.error(`Generated ${type} error for testing`);
		} catch (err) {
			toast.error('Failed to generate test error');
			console.error('Error generation failed:', err);
		} finally {
			isGeneratingError = false;
		}
	}
	
	// Clear error history
	function clearHistory() {
		errorHistory = [];
		toast.success('Error history cleared');
	}
	
	// Reset examples to original set
	function resetExamples() {
		// Remove dynamically added examples
		while (examples.length > 6 && examples[examples.length - 1].code.startsWith('LIVE')) {
			examples.pop();
		}
		currentExample = 0;
		toast.success('Reset to original examples');
	}
</script>

<svelte:head>
	<title>Error Panel Demo</title>
</svelte:head>

<div class="container mx-auto p-8 space-y-8">
	<div class="text-center">
		<h1 class="text-4xl font-bold mb-4">ErrorPanel Component Demo</h1>
		<p class="text-lg text-muted-foreground mb-6">
			Comprehensive error handling and display system with syntax highlighting, copy functionality, and robust error processing.
		</p>
		<div class="flex justify-center gap-4">
			<Badge variant="outline">Svelte 5</Badge>
			<Badge variant="outline">TypeScript</Badge>
			<Badge variant="outline">Tailwind CSS</Badge>
			<Badge variant="outline">Syntax Highlighting</Badge>
		</div>
	</div>
	
	<!-- Example Selector -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Error Examples & Live Generation</Card.Title>
			<Card.Description>
				Select from predefined examples or generate live errors for testing
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<!-- Predefined Examples -->
				<div>
					<h3 class="text-sm font-medium mb-2">Predefined Examples:</h3>
					<div class="flex gap-2 flex-wrap">
						{#each examples.slice(0, 6) as example, i}
							<Button
								variant={i === currentExample ? 'default' : 'outline'}
								size="sm"
								onclick={() => currentExample = i}
							>
								{example.code}
							</Button>
						{/each}
					</div>
				</div>
				
				<!-- Live Error Generation -->
				<div>
					<h3 class="text-sm font-medium mb-2">Generate Live Errors:</h3>
					<div class="flex gap-2 flex-wrap">
						<Button
							variant="destructive"
							size="sm"
							onclick={() => triggerError('network')}
							disabled={isGeneratingError}
						>
							Network Error
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onclick={() => triggerError('permission')}
							disabled={isGeneratingError}
						>
							Permission Error
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onclick={() => triggerError('validation')}
							disabled={isGeneratingError}
						>
							Validation Error
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onclick={() => triggerError('timeout')}
							disabled={isGeneratingError}
						>
							Timeout Error
						</Button>
					</div>
				</div>
				
				<!-- Dynamic Examples -->
				{#if examples.length > 6}
					<div>
						<h3 class="text-sm font-medium mb-2">Generated Examples:</h3>
						<div class="flex gap-2 flex-wrap">
							{#each examples.slice(6) as example, i}
								<Button
									variant={i + 6 === currentExample ? 'default' : 'secondary'}
									size="sm"
									onclick={() => currentExample = i + 6}
								>
									{example.code}
								</Button>
							{/each}
							<Button
								variant="outline"
								size="sm"
								onclick={resetExamples}
							>
								Reset
							</Button>
						</div>
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Current Example Display -->
	{#key currentExample}
		<ErrorPanel
			errorCode={examples[currentExample].code}
			errorMessage={examples[currentExample].message}
			errorDetails={examples[currentExample].details}
			language={examples[currentExample].language}
		/>
	{/key}

	<!-- Usage Documentation -->
	<div class="mt-16 prose dark:prose-invert max-w-none">
		<h2>Usage</h2>
		<p>The ErrorPanel component is flexible and reusable. Here are the available props:</p>
		
		<h3>Props</h3>
		<ul>
			<li><code>errorCode</code> (required): The error code (e.g., 500, 404, 403)</li>
			<li><code>errorMessage</code> (required): The error message or logs to display</li>
			<li><code>errorDetails</code> (optional): Additional error details or stack trace</li>
			<li><code>language</code> (optional): Language for syntax highlighting (default: 'typescript')</li>
			<li><code>showCopyButton</code> (optional): Whether to show the copy button (default: true)</li>
			<li><code>startCollapsed</code> (optional): Whether to start collapsed (default: true)</li>
			<li><code>title</code> (optional): Custom title instead of auto-generated title</li>
			<li><code>class</code> (optional): Additional CSS classes</li>
		</ul>

		<h3>Example Usage</h3>
		<pre><code>{`<script>
	import ErrorPanel from '$lib/components/ErrorPanelComplete.svelte';
</script>

<ErrorPanel
	errorCode={500}
	errorMessage={\`Database connection failed

Details:
Connection timeout after 30 seconds...\`}
	language="typescript"
/>`}</code></pre>
	</div>
</div>
