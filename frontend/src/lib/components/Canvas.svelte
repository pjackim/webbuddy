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
	let viewport = { width: 0, height: 0 };

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
		const factor = 1.05;
		const direction = e.deltaY > 0 ? -1 : 1;
		scale = Math.max(0.05, Math.min(5, scale * (direction > 0 ? factor : 1 / factor)));
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
		if (browser) {
			const updateViewport = () => {
				viewport = { width: window.innerWidth, height: window.innerHeight };
			};
			updateViewport();
			window.addEventListener('resize', updateViewport);
			return () => window.removeEventListener('resize', updateViewport);
		}
	});
</script>

<!-- attach event listeners to window and gate them to the container -->
<svelte:window
	on:wheel={onWheel}
	on:mousedown={onMouseDown}
	on:mousemove={onMouseMove}
	on:mouseup={onMouseUp}
/>

<section
	class="w-full h-[calc(100vh-64px)]"
	bind:this={container}
	aria-label="Canvas area"
>
			<Stage
				config={{
			width: viewport.width,
			height: Math.max(0, viewport.height - 64),
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
