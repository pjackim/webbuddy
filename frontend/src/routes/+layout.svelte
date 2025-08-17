<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Grid } from '$lib/features/grid';
	import { createErrorInfo, handleError } from '$lib/stores/error';
	import { gridVisibility } from '$lib/stores/grid';
	import { Button } from '$lib/ui/button';
	import { Toaster } from '$lib/ui/sonner';
	import '$styles/app.css';
	import Cog from '@lucide/svelte/icons/cog';
	import { ModeWatcher } from 'mode-watcher';
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

			const error = createErrorInfo('JS', new Error(errorMessage), details, window.location.href);
			handleError(error);
		});
	});
	
	// Disable text selection during pointer drag (left mouse, touch, pen)
	onMount(() => {
		const html = document.documentElement;
		let active = false;

		const start = (e: PointerEvent) => {
			// Only primary mouse button; allow touch/pen
			if (e.pointerType === 'mouse' && e.button !== 0) return;
			active = true;
			html.classList.add('dragging');
		};

		const end = () => {
			if (!active) return;
			active = false;
			html.classList.remove('dragging');
		};

		window.addEventListener('pointerdown', start, { passive: true });
		window.addEventListener('pointerup', end, { passive: true });
		window.addEventListener('pointercancel', end, { passive: true });
		window.addEventListener('blur', end);

		return () => {
			window.removeEventListener('pointerdown', start);
			window.removeEventListener('pointerup', end);
			window.removeEventListener('pointercancel', end);
			window.removeEventListener('blur', end);
		};
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

<Tooltip.Provider>
	<ModeWatcher />
	<Toaster />
	{@render children?.()}
</Tooltip.Provider>
