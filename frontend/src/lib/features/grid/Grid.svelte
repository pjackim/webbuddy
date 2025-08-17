<!--
  File: src/lib/features/grid/Grid.svelte
  Description: A Svelte 5 component for a modern, infinitely zoomable and pannable background grid or dot pattern with smooth animations.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { gridSettings, performanceSettings } from '$lib/stores/settings';

	type GridProps = {
		class?: string;
	};

	const {
		class: additionalClasses = ''
	}: GridProps = $props();

	// Get reactive access to settings without complex derived chains
	let settings = $derived(gridSettings.current);
	let perfSettings = $derived(performanceSettings.current);

	let canvasElement: HTMLCanvasElement | undefined = $state();
	let pan = $state({ x: 0, y: 0 });
	let zoom = $state(1);
	let panTarget = $state({ x: 0, y: 0 });
	let zoomTarget = $state(1);
	let isPanning = $state(false);
	let lastMousePosition = $state({ x: 0, y: 0 });
	let dimensions = $state({ width: 0, height: 0 });

	$effect(() => {
		if (!canvasElement || !settings.visible) return;
		const ctx = canvasElement.getContext('2d');
		if (!ctx) return;

		const { width, height } = dimensions;
		ctx.fillStyle = settings.backgroundColor;
		ctx.fillRect(0, 0, width, height);

		ctx.save();
		ctx.translate(pan.x, pan.y);
		ctx.scale(zoom, zoom);

		const view = {
			x1: -pan.x / zoom,
			y1: -pan.y / zoom,
			x2: (width - pan.x) / zoom,
			y2: (height - pan.y) / zoom
		};

		const startIndexX = Math.floor(view.x1 / settings.size);
		const startIndexY = Math.floor(view.y1 / settings.size);
		const endIndexX = Math.ceil(view.x2 / settings.size);
		const endIndexY = Math.ceil(view.y2 / settings.size);

		// Compute colors with opacity  
		const patternColor = `${settings.color.replace(')', ` / ${settings.opacity})`)}`;
		const majorLineColor = `${settings.majorColor.replace(')', ` / ${settings.majorOpacity})`)}`;

		if (settings.pattern === 'dots') {
			const scaledRadius = settings.dotRadius / zoom;
			const scaledMajorRadius = settings.majorDotRadius / zoom;
			const minorDots = new Path2D();
			const majorDots = new Path2D();

			for (let i = startIndexX; i <= endIndexX; i++) {
				for (let j = startIndexY; j <= endIndexY; j++) {
					const x = i * settings.size;
					const y = j * settings.size;
					const isMajor = i % settings.majorLineInterval === 0 && j % settings.majorLineInterval === 0;
					if (isMajor) {
						majorDots.moveTo(x, y);
						majorDots.arc(x, y, scaledMajorRadius, 0, 2 * Math.PI);
					} else {
						minorDots.moveTo(x, y);
						minorDots.arc(x, y, scaledRadius, 0, 2 * Math.PI);
					}
				}
			}
			ctx.fillStyle = patternColor;
			ctx.fill(minorDots);
			ctx.fillStyle = majorLineColor;
			ctx.fill(majorDots);
		} else if (settings.pattern === 'grid') {
			const minorLines = new Path2D();
			const majorLines = new Path2D();

			for (let i = startIndexX; i <= endIndexX; i++) {
				const x = i * settings.size;
				const isMajor = i % settings.majorLineInterval === 0;
				const path = isMajor ? majorLines : minorLines;
				path.moveTo(x, view.y1);
				path.lineTo(x, view.y2);
			}
			for (let j = startIndexY; j <= endIndexY; j++) {
				const y = j * settings.size;
				const isMajor = j % settings.majorLineInterval === 0;
				const path = isMajor ? majorLines : minorLines;
				path.moveTo(view.x1, y);
				path.lineTo(view.x2, y);
			}
			ctx.strokeStyle = patternColor;
			ctx.lineWidth = settings.lineThickness / zoom;
			ctx.stroke(minorLines);
			ctx.strokeStyle = majorLineColor;
			ctx.lineWidth = settings.majorLineThickness / zoom;
			ctx.stroke(majorLines);
		}

		ctx.restore();
	});

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		if (!canvasElement) return;
		const rect = canvasElement.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		const worldX = (mouseX - pan.x) / zoom;
		const worldY = (mouseY - pan.y) / zoom;
		const zoomDelta = event.deltaY * perfSettings.zoomSensitivity;
		const newZoom = Math.max(perfSettings.minZoom, Math.min(perfSettings.maxZoom, zoomTarget - zoomDelta));
		panTarget.x = mouseX - worldX * newZoom;
		panTarget.y = mouseY - worldY * newZoom;
		zoomTarget = newZoom;
	}

	function handleMouseDown(event: MouseEvent) {
		isPanning = true;
		lastMousePosition = { x: event.clientX, y: event.clientY };
	}

	function handleMouseUp() {
		isPanning = false;
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isPanning) return;
		const dx = event.clientX - lastMousePosition.x;
		const dy = event.clientY - lastMousePosition.y;
		panTarget.x += dx;
		panTarget.y += dy;
		lastMousePosition = { x: event.clientX, y: event.clientY };
	}

	function handleDoubleClick() {
		if (!canvasElement) return;
		const { width, height } = dimensions;
		panTarget = { x: width / 2, y: height / 2 };
		zoomTarget = 1;
	}

	onMount(() => {
		// capture a stable reference for use in closures
		const el = canvasElement;
		if (!el) return;

		const resizeObserver = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			const { width, height } = entry.contentRect;
			el.width = width;
			el.height = height;
			dimensions = { width, height };
		});
		resizeObserver.observe(el);

		const rect = el.getBoundingClientRect();
		el.width = rect.width;
		el.height = rect.height;
		dimensions = { width: rect.width, height: rect.height };

		const initialPan = { x: rect.width / 2, y: rect.height / 2 };
		pan = { ...initialPan };
		panTarget = { ...initialPan };

		let frameId: number;
		const animate = () => {
			const panDistance = Math.hypot(panTarget.x - pan.x, panTarget.y - pan.y);
			const zoomDistance = Math.abs(zoomTarget - zoom);

			if (perfSettings.enableAnimations && (panDistance > 0.01 || zoomDistance > 0.01)) {
				pan.x += (panTarget.x - pan.x) * perfSettings.animationDamping;
				pan.y += (panTarget.y - pan.y) * perfSettings.animationDamping;
				zoom += (zoomTarget - zoom) * perfSettings.animationDamping;
				frameId = requestAnimationFrame(animate);
			} else if (!perfSettings.enableAnimations) {
				// Snap immediately when animations are disabled
				pan.x = panTarget.x;
				pan.y = panTarget.y;
				zoom = zoomTarget;
				frameId = requestAnimationFrame(animate);
			} else {
				pan.x = panTarget.x;
				pan.y = panTarget.y;
				zoom = zoomTarget;
				frameId = requestAnimationFrame(animate);
			}
		};
		animate();

		return () => {
			resizeObserver.disconnect();
			cancelAnimationFrame(frameId);
		};
	});
</script>

<div
	class="grid-container {additionalClasses}"
	role="img"
	aria-label="Interactive grid background"
	onmousedown={handleMouseDown}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
	onmousemove={handleMouseMove}
	ondblclick={handleDoubleClick}
>
	<canvas bind:this={canvasElement} onwheel={handleWheel} class:panning={isPanning}></canvas>
</div>

<style lang="postcss">
	.grid-container {
		width: 100%;
		height: 100%;
		overflow: hidden;
		position: relative;
		cursor: grab;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		touch-action: none;
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
