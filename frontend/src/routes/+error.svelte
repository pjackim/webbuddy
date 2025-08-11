<script lang="ts">
	import { page } from '$app/stores';
	import ErrorPanel from '$lib/components/ErrorPanelComplete.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	
	// Format error details for display
	$: errorDetails = $page.error?.stack || $page.error?.message || 'No additional details available';
	
	// Determine error message
	$: errorMessage = (() => {
		if ($page.error instanceof Error) {
			return $page.error;
		}
		return $page.error?.message || 'An unexpected error occurred';
	})();
	
	// Get appropriate language for syntax highlighting
	$: language = (() => {
		if ($page.error instanceof Error) return 'javascript';
		if (errorDetails.includes('{') || errorDetails.includes('[')) return 'json';
		return 'typescript';
	})();
</script>

<svelte:head>
	<title>Error {$page.status} - WebBuddy</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<div class="flex-1">
		<ErrorPanel
			errorCode={$page.status}
			{errorMessage}
			errorDetails={errorDetails}
			{language}
			startCollapsed={false}
			class="min-h-screen"
		/>
	</div>
	
	<!-- Action buttons -->
	<div class="p-6 border-t bg-muted/10">
		<div class="max-w-4xl mx-auto flex justify-center gap-4">
			<Button variant="outline" on:click={() => window.history.back()}>
				Go Back
			</Button>
			<Button on:click={() => window.location.href = '/'}>
				Go Home
			</Button>
			<Button variant="outline" on:click={() => window.location.reload()}>
				Reload Page
			</Button>
		</div>
	</div>
</div>