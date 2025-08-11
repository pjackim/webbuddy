<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Stage, Layer } from 'svelte-konva';
	import ScreenFrame from './ScreenFrame.svelte';
	import { Grid } from './ui/grid/index.js';
	import { screens, setScreens } from '$lib/stores.svelte.ts';
	import type { Screen as StoreScreen } from '$lib/stores.svelte.ts';
	import { api } from '../api';
	import { connectWS } from '../ws';

	let scale = $state(0.5);
	let offset = $state({ x: 0, y: 0 });
	let panning = $state(false);
	let last = { x: 0, y: 0 };
	let container: HTMLElement;
	let viewport = $state({ width: 0, height: 0 });
	let gridEnabled = $state(true);

	async function load() {
		const sc = await api('/screens');
		setScreens(sc as StoreScreen[]);
		const all = await api('/assets');
		// assets store filled indirectly in ScreenFrame via events or do it here if preferred
		// We'll broadcast on initial GET too for simplicity: update locally
		// but to keep simple, ScreenFrame will fetch per screen.
	}

	function onWheel(e: WheelEvent) {
		if (!container || !(e.target instanceof Node) || !container.contains(e.target)) return;
		e.preventDefault();
		
		const rect = container.getBoundingClientRect();
		const pointer = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
		
		const factor = 1.1;
		const direction = e.deltaY > 0 ? -1 : 1;
		const oldScale = scale;
		const newScale = Math.max(0.1, Math.min(3, scale * (direction > 0 ? factor : 1 / factor)));
		
		const mousePointTo = {
			x: (pointer.x - offset.x) / oldScale,
			y: (pointer.y - offset.y) / oldScale
		};
		
		const newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale
		};
		
		scale = newScale;
		offset = newPos;
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

	function resetView() {
		scale = 0.5;
		offset = { 
			x: viewport.width / 2, 
			y: (viewport.height - 64) / 2 
		};
	}
	
	function toggleGrid() {
		gridEnabled = !gridEnabled;
	}

	onMount(() => {
		connectWS();
		load();
		if (browser) {
			const updateViewport = () => {
				const newViewport = { width: window.innerWidth, height: window.innerHeight };
				if (viewport.width === 0 && viewport.height === 0) {
					resetView();
				}
				viewport = newViewport;
			};
			updateViewport();
			window.addEventListener('resize', updateViewport);
			window.addEventListener('keydown', (e) => {
				if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
					toggleGrid();
				} else if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
					resetView();
				}
			});
			return () => {
				window.removeEventListener('resize', updateViewport);
				window.removeEventListener('keydown', toggleGrid);
			};
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

<section class="relative w-full h-[calc(100vh-64px)]" bind:this={container} aria-label="Canvas area">
	{#if gridEnabled}
		<div class="absolute inset-0">
			<Grid 
				pattern="grid"
				gridSize={40}
				patternColor="hsl(var(--muted-foreground) / 0.15)"
				majorLineColor="hsl(var(--muted-foreground) / 0.25)"
				backgroundColor="hsl(var(--background))"
				class="w-full h-full"
			/>
		</div>
	{/if}
	<div class="relative z-10">
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
				{#each screens() as sc}
					<ScreenFrame {sc} />
				{/each}
			</Layer>
		</Stage>
	</div>
	
	<div class="absolute bottom-4 left-4 flex gap-2 z-20">
		<button
			class="px-3 py-1 bg-background/80 backdrop-blur-sm border rounded text-sm hover:bg-muted"
			onclick={toggleGrid}
		>
			{gridEnabled ? 'Hide Grid' : 'Show Grid'} (G)
		</button>
		<button
			class="px-3 py-1 bg-background/80 backdrop-blur-sm border rounded text-sm hover:bg-muted"
			onclick={resetView}
		>
			Reset View (R)
		</button>
		<div class="px-3 py-1 bg-background/80 backdrop-blur-sm border rounded text-sm">
			Zoom: {Math.round(scale * 100)}%
		</div>
	</div>
</section>