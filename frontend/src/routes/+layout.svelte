<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { handleError, createErrorInfo } from '$lib/error-store.svelte.js';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { Grid } from '$lib/components/ui/grid';
	import { gridVisibility } from '$lib/stores/grid';
	import { Button } from '$lib/components/ui/button';
	import { Cog } from 'lucide-svelte';

	let { children } = $props();

	// Global error handling
	onMount(() => {
		// Handle uncaught JavaScript errors
		window.addEventListener('error', (event) => {
			const error = createErrorInfo(
				'JS',
				event.error || new Error(event.message),
				`File: ${event.filename}:${event.lineno}:${event.colno}`,
				window.location.href
			);
			handleError(error);
		});

		// Handle unhandled promise rejections
		window.addEventListener('unhandledrejection', (event) => {
			let errorMessage = 'Unhandled promise rejection';
			let details = '';

			if (event.reason instanceof Error) {
				errorMessage = event.reason.message;
				details = event.reason.stack || '';
			} else if (typeof event.reason === 'string') {
				errorMessage = event.reason;
			} else {
				details = JSON.stringify(event.reason, null, 2);
			}

			const error = createErrorInfo(
				'JS',
				new Error(errorMessage),
				details,
				window.location.href
			);
			handleError(error);
		});
	});

	function toggleGrid() {
		gridVisibility.current = !gridVisibility.current;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if gridVisibility.current}
	<div class="fixed inset-0 -z-10">
		<Grid />
	</div>
{/if}

<div class="fixed bottom-4 right-4 z-50">
	<Button on:click={toggleGrid} variant="outline" size="icon">
		<Cog class="h-4 w-4" />
		<span class="sr-only">Toggle Grid</span>
	</Button>
</div>

<ModeWatcher />
<Toaster />
{@render children?.()}
