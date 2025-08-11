<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import ErrorModal from '$lib/components/ErrorModal.svelte';
	import { handleError, createErrorInfo } from '$lib/error-store.svelte.js';
	import { onMount } from 'svelte';

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
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<ModeWatcher />
<Toaster />
<ErrorModal />
{@render children?.()}
