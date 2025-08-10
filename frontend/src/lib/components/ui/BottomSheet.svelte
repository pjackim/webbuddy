<script lang="ts">
	import { useEventListener, onClickOutside } from 'runed';

	// Whether the sheet is visible. Can be controlled via bind:open
	export let open = $state(false);

	// expose close function for consumers
	function close() {
		open = false;
	}

	let sheet: HTMLElement;

	// Close on escape key
	useEventListener(
		() => window,
		'keydown',
		(e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
		}
	);

	// Close when clicking outside the sheet
	onClickOutside(() => sheet, close);
</script>

<div
	class="fixed inset-0 z-50 flex flex-col items-end justify-end transition pointer-events-none"
	data-open={open}
>
	<!-- overlay -->
	<div
		class="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300"
		class:opacity-100={open}
		on:click={close}
	/>

	<!-- sheet panel -->
	<div
		bind:this={sheet}
		class="relative w-full max-h-[90vh] rounded-t-xl bg-base-100 shadow-lg transform transition-transform duration-300 translate-y-full"
		class:translate-y-0={open}
		style="touch-action: none;"
		role="dialog"
		aria-modal="true"
	>
		<slot />
	</div>
</div>

<style>
	div[data-open='true'] {
		pointer-events: auto;
	}
</style>
