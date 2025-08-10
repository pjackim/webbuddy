<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Stage, Layer } from 'svelte-konva';
	import ScreenFrame from './ScreenFrame.svelte';
	import { screens, assetsByScreen, online } from '../stores';
	import type { Screen as StoreScreen } from '../stores';
	import { api } from '../api';
	import { connectWS } from '../ws';



	let scale = 0.25; // stage zoom
	let offset = { x: 0, y: 0 };
	let panning = false;
	let last = { x: 0, y: 0 };
	// add a ref to the canvas container
	let container: HTMLElement;
	// viewport size (avoid window usage during SSR). Track container size for responsiveness
	let viewport = { width: 1024, height: 768 };
	let ro: ResizeObserver | undefined;

	async function load() {
		const sc = await api('/screens');
		screens.set(sc as StoreScreen[]);
		const all = await api('/assets');
		// assets store filled indirectly in ScreenFrame via events or do it here if preferred
		// We'll broadcast on initial GET too for simplicity: update locally
		// but to keep simple, ScreenFrame will fetch per screen.
	}

	function onWheel(e: WheelEvent) {
		// only handle wheel inside the canvas container
		if (!container || !(e.target instanceof Node) || !container.contains(e.target)) return;
		e.preventDefault();

		// Mouse position in container (screen coords relative to stage container)
		const rect = container.getBoundingClientRect();
		const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };

		// World coords under cursor before zoom
		const world = { x: (mouse.x - offset.x) / scale, y: (mouse.y - offset.y) / scale };

		// Base zoom factor; hold Shift to double the zoom step (faster zoom)
		const base = 1.15;
		const step = e.shiftKey ? base * base : base;

		const direction = e.deltaY > 0 ? -1 : 1;
		const newScale = Math.max(0.05, Math.min(5, scale * (direction > 0 ? step : 1 / step)));

		// Recenter so the world point under the mouse stays fixed after zoom
		offset.x = mouse.x - world.x * newScale;
		offset.y = mouse.y - world.y * newScale;

		scale = newScale;
	}

	function onMouseDown(e: MouseEvent) {
		// only start panning when inside the canvas container
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

	onMount(() => {
		connectWS();
		load();
		// initialize viewport on client
		if (browser) {
			syncViewport();
			// observe container size to keep stage responsive
			if (container && 'ResizeObserver' in window) {
				ro = new ResizeObserver(() => syncViewport());
				ro.observe(container);
			}
		}
	});

	function syncViewport() {
		if (container) {
			const rect = container.getBoundingClientRect();
			viewport = { width: Math.max(0, rect.width), height: Math.max(0, rect.height) };
		} else if (browser) {
			viewport = { width: window.innerWidth, height: window.innerHeight };
		}
	}
</script>

<!-- attach event listeners to window and gate them to the container -->
<svelte:window
	on:wheel={onWheel}
	on:mousedown={onMouseDown}
	on:mousemove={onMouseMove}
	on:mouseup={onMouseUp}
	on:resize={syncViewport}
/>

<section
	class="w-full h-full min-h-[20rem]"
	bind:this={container}
	aria-label="Canvas area"
>
	{#if browser}
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
	{/if}
</section>
