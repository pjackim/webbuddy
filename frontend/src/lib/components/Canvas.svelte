<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Stage, Layer } from 'svelte-konva';
	import ScreenFrame from './ScreenFrame.svelte';
	import Grid from './Grid.svelte';
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

	// Smooth zoom animation state
	let rafId: number = 0;
	let anim:
		| {
				start: number;
				fromScale: number;
				fromOffset: { x: number; y: number };
				toScale: number;
				toOffset: { x: number; y: number };
				duration: number;
		  }
		| null = null;

	function easeOutCubic(t: number) {
		return 1 - Math.pow(1 - t, 3);
	}

	function animateTo(toScale: number, toOffset: { x: number; y: number }, duration = 120) {
		// Start from current visual state to keep it snappy when chaining wheel events
		const now = performance.now();
		anim = {
			start: now,
			fromScale: scale,
			fromOffset: { ...offset },
			toScale,
			toOffset: { ...toOffset },
			duration
		};
		if (!rafId) rafId = requestAnimationFrame(step);
	}

	function step(now: number) {
		if (!anim) {
			rafId = 0;
			return;
		}
		const t = Math.min(1, (now - anim.start) / anim.duration);
		const e = easeOutCubic(t);

		scale = anim.fromScale + (anim.toScale - anim.fromScale) * e;
		offset.x = anim.fromOffset.x + (anim.toOffset.x - anim.fromOffset.x) * e;
		offset.y = anim.fromOffset.y + (anim.toOffset.y - anim.fromOffset.y) * e;

		if (t < 1) {
			rafId = requestAnimationFrame(step);
		} else {
			// snap to target at the end
			scale = anim.toScale;
			offset = { ...anim.toOffset };
			anim = null;
			rafId = 0;
		}
	}

	async function load() {
		try {
			const sc = await api('/screens');
			screens.set(sc as StoreScreen[]);
			await api('/assets');
		} catch (err) {
			console.error('Failed to load initial data', err);
		}
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

		// World coords under cursor before zoom (from current visual state)
		const world = { x: (mouse.x - offset.x) / scale, y: (mouse.y - offset.y) / scale };

		// Base zoom factor; hold Shift to double the zoom step (faster zoom)
		const base = 1.15;
		const step = e.shiftKey ? base * base : base;

		const direction = e.deltaY > 0 ? -1 : 1;
		const targetScale = Math.max(0.05, Math.min(5, scale * (direction > 0 ? step : 1 / step)));

		// Compute target offset so the world point under the mouse stays fixed after zoom
		const targetOffset = {
			x: mouse.x - world.x * targetScale,
			y: mouse.y - world.y * targetScale
		};

		// Smoothly animate towards the new zoom/offset for a snappy yet smooth experience
		animateTo(targetScale, targetOffset, e.shiftKey ? 80 : 110);
	}

	function onMouseDown(e: MouseEvent) {
		// only start panning when inside the canvas container
		if (!container || !(e.target instanceof Node) || !container.contains(e.target)) return;
		panning = true;

		// cancel any ongoing zoom animation for responsive panning
		if (rafId) {
			cancelAnimationFrame(rafId);
			rafId = 0;
		}
		anim = null;

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
	class="relative isolate w-full h-full min-h-[20rem]"
	bind:this={container}
	aria-label="Canvas area"
>
	{#if browser}
		<!-- Grid: last thing before viewport background, anchored to world transform -->
		<Grid
			width={viewport.width}
			height={viewport.height}
			{scale}
			{offset}
			baseSize={50}
			subdivisions={5}
			showAxes={true}
		/>

		<!-- Stage content above grid -->
		<div class="absolute inset-0 z-10">
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

			{#if $screens.length === 0}
				<div class="absolute inset-0 grid place-items-center pointer-events-none">
					<div class="badge badge-lg bg-base-200 text-base-content/70 shadow">
						No screens yet — use "Add Screen" in the toolbar
					</div>
				</div>
			{/if}
		</div>
	{/if}
</section>
