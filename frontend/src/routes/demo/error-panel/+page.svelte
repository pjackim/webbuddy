<script lang="ts">
	import ErrorPanel from '$lib/components/ErrorPanelComplete.svelte';

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
		}
	];

	let currentExample = $state(0);
</script>

<svelte:head>
	<title>Error Panel Demo</title>
</svelte:head>

<div class="container mx-auto p-8">
	<h1 class="text-3xl font-bold mb-8">ErrorPanel Component Demo</h1>
	
	<!-- Example Selector -->
	<div class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Examples:</h2>
		<div class="flex gap-4">
			{#each examples as example, i}
				<button
					class="px-4 py-2 rounded-lg {i === currentExample ? 'bg-primary text-primary-foreground' : 'bg-muted'}"
					onclick={() => currentExample = i}
				>
					{example.code} Error
				</button>
			{/each}
		</div>
	</div>

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
	import ErrorPanel from '$lib/components/ErrorPanel.svelte';
</script>

<ErrorPanel
	errorCode={500}
	errorMessage="Database connection failed"
	errorDetails="Connection timeout after 30 seconds..."
	language="typescript"
	showCopyButton={true}
	startCollapsed={true}
/>`}</code></pre>
	</div>
</div>
