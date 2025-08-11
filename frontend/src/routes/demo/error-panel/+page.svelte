<script lang="ts">
	import { ErrorPanelComplete as ErrorPanel } from '$lib/features/error-panel';
	import * as Card from '$lib/ui/card';
	import { Button } from '$lib/ui/button';
	import { Badge } from '$lib/ui/badge';
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
		while (examples.length > 4 && examples[examples.length - 1].code.startsWith('LIVE')) {
			examples.pop();
		}
		currentExample = 0;
		toast.success('Reset to original examples');
	}
</script>

<svelte:head>
	<title>Error Panel Demo</title>
</svelte:head>

<div class="demo-layout">
	<!-- Header Section -->
	<div class="text-center space-y-4">
		<h1 class="text-4xl font-bold">ErrorPanel Component Demo</h1>
		<p class="text-lg text-muted-foreground max-w-3xl mx-auto">
			Comprehensive error handling and display system with syntax highlighting, copy functionality,
			and robust error processing.
		</p>
		<div class="flex justify-center gap-4 flex-wrap">
			<Badge variant="outline">Svelte 5</Badge>
			<Badge variant="outline">TypeScript</Badge>
			<Badge variant="outline">Tailwind CSS</Badge>
			<Badge variant="outline">Syntax Highlighting</Badge>
		</div>
	</div>

	<!-- Controls Section -->
	<Card.Root class="responsive-card">
		<Card.Header class="flex-shrink-0">
			<Card.Title>Error Examples & Live Generation</Card.Title>
			<Card.Description>
				Select from predefined examples or generate live errors for testing
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<!-- Predefined Examples -->
			<div>
				<h3 class="text-sm font-medium mb-2">Predefined Examples:</h3>
				<div class="flex gap-2 flex-wrap">
					{#each examples.slice(0, 4) as example, i}
						<Button
							variant={i === currentExample ? 'default' : 'outline'}
							size="sm"
							onclick={() => (currentExample = i)}
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
			{#if examples.length > 4}
				<div>
					<h3 class="text-sm font-medium mb-2">Generated Examples:</h3>
					<div class="flex gap-2 flex-wrap">
						{#each examples.slice(4) as example, i}
							<Button
								variant={i + 4 === currentExample ? 'default' : 'secondary'}
								size="sm"
								onclick={() => (currentExample = i + 4)}
							>
								{example.code}
							</Button>
						{/each}
						<Button variant="ghost" size="sm" onclick={resetExamples}>Reset</Button>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Error Display Section -->
	<Card.Root class="responsive-card flex-1 min-h-0">
		<Card.Header class="flex-shrink-0">
			<div class="flex items-center justify-between">
				<Card.Title>Error Display</Card.Title>
				<Badge variant="secondary">
					{examples[currentExample]?.language || 'typescript'}
				</Badge>
			</div>
			<Card.Description>
				Showing: {examples[currentExample]?.code} -
				{typeof examples[currentExample]?.message === 'object'
					? examples[currentExample]?.message?.name || 'Error'
					: 'Custom Error'}
			</Card.Description>
		</Card.Header>
		<Card.Content class="responsive-card-content">
			<div class="h-full">
				{#key currentExample}
					{#if examples[currentExample]}
						<ErrorPanel
							errorCode={examples[currentExample].code}
							errorMessage={examples[currentExample].message}
							errorDetails={examples[currentExample].details}
							language={examples[currentExample].language}
							class="h-full border-0 p-0"
						/>
					{:else}
						<div class="flex items-center justify-center h-full">
							<p class="text-muted-foreground">No error selected</p>
						</div>
					{/if}
				{/key}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- History Section -->
	{#if errorHistory.length > 0}
		<Card.Root class="responsive-card max-h-48">
			<Card.Header class="flex-shrink-0">
				<div class="flex items-center justify-between">
					<Card.Title>Error History</Card.Title>
					<Button variant="outline" size="sm" onclick={clearHistory}>Clear History</Button>
				</div>
				<Card.Description>
					Track of dynamically generated errors for testing and debugging
				</Card.Description>
			</Card.Header>
			<Card.Content class="responsive-card-content">
				<div class="scrollable-content space-y-2">
					{#each errorHistory as historyItem}
						<div class="flex items-center gap-3 p-2 bg-muted/50 rounded text-sm">
							<Badge variant="destructive" class="text-xs">{historyItem.type}</Badge>
							<span class="font-mono text-muted-foreground">
								{historyItem.timestamp.toLocaleTimeString()}
							</span>
							<span class="truncate flex-1">
								{historyItem.error?.message || 'Unknown error'}
							</span>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
