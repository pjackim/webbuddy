<!--
  File: src/lib/components/ui/grid/grid.svelte
  Description: A Svelte 5 component for an infinitely zoomable and pannable background grid or dot pattern.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	/**
	 * Props for the Grid component, using Svelte 5's $props rune.
	 * This allows for type-safe and reactive properties.
	 */
	type GridProps = {
		/** The type of pattern to display. */
		pattern?: 'dots' | 'grid';
		/** The spacing between pattern elements, in pixels at 1x zoom. */
		gridSize?: number;
		/** The radius of the dots, in pixels. */
		dotRadius?: number;
		/** The thickness of the grid lines, in pixels. */
		lineThickness?: number;
		/** The minimum allowed zoom level. */
		minZoom?: number;
		/** The maximum allowed zoom level. */
		maxZoom?: number;
		/** The sensitivity of the zoom action. */
		zoomSensitivity?: number;
		/** The color of the pattern, defaults to a subtle foreground color. */
		patternColor?: string;
		/** The background color, defaults to the theme's background. */
		backgroundColor?: string;
		/** Additional CSS classes to apply to the container. */
		class?: string;
	};

	const {
		pattern = 'dots',
		gridSize = 50,
		dotRadius = 1,
		lineThickness = 1,
		minZoom = 0.1,
		maxZoom = 10,
		zoomSensitivity = 0.001,
		patternColor = 'hsl(var(--foreground) / 0.1)',
		backgroundColor = 'hsl(var(--background))',
		class: additionalClasses = '',
	}: GridProps = $props();

	// Svelte 5 Runes for reactive state
	let canvasElement: HTMLCanvasElement | undefined = $state();
	let pan = $state({ x: 0, y: 0 });
	let zoom = $state(1);
	let isPanning = $state(false);
	let lastMousePosition = $state({ x: 0, y: 0 });
	let dimensions = $state({ width: 0, height: 0 });

	/**
	 * Main drawing logic. This $effect hook re-runs whenever any of its
	 * dependencies (pan, zoom, dimensions, props) change.
	 */
	$effect(() => {
		if (!canvasElement) return;

		const ctx = canvasElement.getContext('2d');
		if (!ctx) return;

		const { width, height } = dimensions;

		// Clear the canvas for redrawing
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, width, height);

		// Save the default context state
		ctx.save();

		// Apply pan and zoom transformations
		ctx.translate(pan.x, pan.y);
		ctx.scale(zoom, zoom);

		ctx.fillStyle = patternColor;
		ctx.strokeStyle = patternColor;

		// Calculate the visible area to avoid drawing off-screen
		const view = {
			x1: -pan.x / zoom,
			y1: -pan.y / zoom,
			x2: (width - pan.x) / zoom,
			y2: (height - pan.y) / zoom
		};

		// Calculate the starting points, aligned to the grid
		const startX = Math.floor(view.x1 / gridSize) * gridSize;
		const startY = Math.floor(view.y1 / gridSize) * gridSize;

		if (pattern === 'dots') {
			// Ensure dots appear the same size regardless of zoom
			const scaledRadius = dotRadius / zoom;
			ctx.beginPath();
			for (let x = startX; x < view.x2; x += gridSize) {
				for (let y = startY; y < view.y2; y += gridSize) {
					ctx.moveTo(x, y);
					ctx.arc(x, y, scaledRadius, 0, 2 * Math.PI);
				}
			}
			ctx.fill();
		} else if (pattern === 'grid') {
			// Ensure lines appear the same thickness regardless of zoom
			ctx.lineWidth = lineThickness / zoom;
			ctx.beginPath();
			// Draw vertical lines
			for (let x = startX; x < view.x2; x += gridSize) {
				ctx.moveTo(x, view.y1);
				ctx.lineTo(x, view.y2);
			}
			// Draw horizontal lines
			for (let y = startY; y < view.y2; y += gridSize) {
				ctx.moveTo(view.x1, y);
				ctx.lineTo(view.x2, y);
			}
			ctx.stroke();
		}

		// Restore the context to its original state
		ctx.restore();
	});

	/**
	 * Handles the wheel event for zooming.
	 */
	function handleWheel(event: WheelEvent) {
		event.preventDefault();

		if (!canvasElement) return;
		const rect = canvasElement.getBoundingClientRect();

		// Mouse position relative to the canvas
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;

		// Calculate the world coordinates before zooming
		const worldX = (mouseX - pan.x) / zoom;
		const worldY = (mouseY - pan.y) / zoom;

		// Calculate the new zoom level
		const zoomDelta = event.deltaY * zoomSensitivity;
		const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom - zoomDelta));

		// Adjust pan to keep the point under the mouse stationary
		pan.x = mouseX - worldX * newZoom;
		pan.y = mouseY - worldY * newZoom;
		zoom = newZoom;
	}

	/**
	 * Initiates panning on mouse down.
	 */
	function handleMouseDown(event: MouseEvent) {
		isPanning = true;
		lastMousePosition = { x: event.clientX, y: event.clientY };
	}

	/**
	 * Ends panning on mouse up.
	 */
	function handleMouseUp() {
		isPanning = false;
	}

	/**
	 * Updates the pan state on mouse move if panning is active.
	 */
	function handleMouseMove(event: MouseEvent) {
		if (!isPanning) return;
		const dx = event.clientX - lastMousePosition.x;
		const dy = event.clientY - lastMousePosition.y;
		pan.x += dx;
		pan.y += dy;
		lastMousePosition = { x: event.clientX, y: event.clientY };
	}

	/**
	 * Sets up a ResizeObserver to make the canvas responsive.
	 * This runs once when the component is mounted.
	 */
	onMount(() => {
		if (!canvasElement) return;

		const resizeObserver = new ResizeObserver((entries) => {
			if (!canvasElement) return;
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				// Update canvas drawing surface size
				canvasElement.width = width;
				canvasElement.height = height;
				// Update reactive state
				dimensions = { width, height };
			}
		});

		resizeObserver.observe(canvasElement);

		// Initial size setting
		const rect = canvasElement.getBoundingClientRect();
		canvasElement.width = rect.width;
		canvasElement.height = rect.height;
		dimensions = { width: rect.width, height: rect.height };


		return () => {
			resizeObserver.disconnect();
		};
	});
</script>

<div
	class="grid-container {additionalClasses}"
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:mouseleave={handleMouseUp}
	on:mousemove={handleMouseMove}
>
	<canvas
		bind:this={canvasElement}
		on:wheel={handleWheel}
		class:panning={isPanning}
	></canvas>
</div>

<style>
	.grid-container {
		width: 100%;
		height: 100%;
		overflow: hidden;
		position: relative;
		cursor: grab;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	.panning {
		cursor: grabbing;
	}
</style>
