<script lang="ts">
	import { onMount } from 'svelte';
	import { Stage, Layer } from 'svelte-konva';
	import ScreenFrame from './ScreenFrame.svelte';
	import { screens } from '../stores';
	import type { Screen as StoreScreen } from '../stores';
	import { api } from '../api';
	import { connectWS } from '../ws';
	import { useEventListener, useResizeObserver } from 'runed';

	let scale = $state(0.25); // stage zoom
	let offset = $state({ x: 0, y: 0 });
	let panning = $state(false);
	let last = $state({ x: 0, y: 0 });
	// ref to the canvas container
	let container: HTMLElement;
	let viewport = $state({ width: 0, height: 0 });

	async function load() {
		const sc = await api('/screens');
		screens.set(sc as StoreScreen[]);
		await api('/assets'); // assets handled per screen
	}

	function onWheel(e: WheelEvent) {
		if (!container || !(e.target instanceof Node) || !container.contains(e.target)) return;
		e.preventDefault();
		const factor = 1.05;
		const direction = e.deltaY > 0 ? -1 : 1;
		scale = Math.max(0.05, Math.min(5, scale * (direction > 0 ? factor : 1 / factor)));
	}

	function onMouseDown(e: MouseEvent) {
		if (!container || !(e.target instanceof Node) || !container.contains(e.target)) return;
		panning = true;
		last = { x: e.clientX, y: e.clientY };
	}
	function onMouseMove(e: MouseEvent) {
		if (!panning) return;
		const dx = e.clientX - last.x;
		const dy = e.clientY - last.y;
		offset.x += dx;
		offset.y += dy;
		last = { x: e.clientX, y: e.clientY };
	}
	function onMouseUp() {
		panning = false;
	}

	if (typeof window !== 'undefined') {
		useEventListener(window, 'wheel', onWheel, { passive: false });
		useEventListener(window, 'mousedown', onMouseDown);
		useEventListener(window, 'mousemove', onMouseMove);
		useEventListener(window, 'mouseup', onMouseUp);
		useResizeObserver(
			() => container,
			(entries) => {
				const rect = entries[0].contentRect;
				viewport = { width: rect.width, height: rect.height };
			}
		);
	}

	onMount(() => {
		connectWS();
		load();
	});
</script>

<section class="w-full h-[calc(100vh-64px)]" bind:this={container} aria-label="Canvas area">
	<Stage
		config={{
			width: viewport.width,
			height: viewport.height,
			scaleX: scale,
			scaleY: scale,
			x: offset.x,
			y: offset.y
		}}
	>
		<Layer>
			{#each $screens as sc}
				<ScreenFrame {sc} />
			{/each}
		</Layer>
	</Stage>
</section>
