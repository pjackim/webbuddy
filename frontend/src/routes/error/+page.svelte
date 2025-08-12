<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { ErrorPanelComplete as ErrorPanel } from '$lib/features/error-panel';
	import { Button } from '$lib/ui/button';
	import { clearError } from '$lib/stores/error';

	let errorData: any = null;
	let errorMessage: string | Error = 'Unknown error';
	let errorCode: number | string = 500;
	let errorDetails: string | undefined;
	let language: 'bash' | 'diff' | 'javascript' | 'json' | 'svelte' | 'typescript' = 'typescript';

	onMount(() => {
		const dataParam = $page.url.searchParams.get('data');
		if (dataParam) {
			try {
				errorData = JSON.parse(decodeURIComponent(dataParam));

				// Reconstruct error message
				if (errorData.message && typeof errorData.message === 'object') {
					// Reconstruct Error object
					const error = new Error(errorData.message.message);
					error.name = errorData.message.name;
					error.stack = errorData.message.stack;
					errorMessage = error;
					language = 'javascript';
				} else {
					errorMessage = errorData.message || 'Unknown error';
				}

				errorCode = errorData.code || 500;
				errorDetails = errorData.details;

				// Determine language based on error type
				if (errorData.code === 'JS' || errorData.code === 'LIVE' || errorMessage instanceof Error) {
					language = 'javascript';
				} else if (errorDetails?.includes('{') || errorDetails?.includes('[')) {
					language = 'json';
				} else if (errorDetails?.includes('GET ') || errorDetails?.includes('POST ')) {
					language = 'bash';
				}
			} catch (e) {
				console.error('Failed to parse error data:', e);
				errorMessage = 'Failed to load error details';
				errorCode = 500;
			}
		} else {
			errorMessage = 'No error data provided';
			errorCode = 400;
		}
	});

	function goBack() {
		clearError();
		window.history.back();
	}

	function goHome() {
		clearError();
		window.location.href = '/';
	}

	function reloadPage() {
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Error {errorCode} - WebBuddy</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<div class="flex-1">
		<ErrorPanel
			{errorCode}
			{errorMessage}
			{errorDetails}
			{language}
			startCollapsed={false}
			class="min-h-screen"
		/>
	</div>

	<!-- Action buttons -->
	<div class="p-6 border-t bg-muted/10">
		<div class="max-w-4xl mx-auto flex justify-center gap-4">
			<Button variant="outline" on:click={goBack}>Go Back</Button>
			<Button on:click={goHome}>Go Home</Button>
			<Button variant="outline" on:click={reloadPage}>Reload Page</Button>
		</div>
	</div>
</div>
