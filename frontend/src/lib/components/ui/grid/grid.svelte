<!--
  File: src/lib/components/ui/grid/grid.svelte
  Description: A Svelte 5 component for a modern, infinitely zoomable and pannable background grid or dot pattern with smooth animations.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	type GridProps = {
		pattern?: 'dots' | 'grid';
		gridSize?: number;
		dotRadius?: number;
		lineThickness?: number;
		majorDotRadius?: number;
		majorLineThickness?: number;
		majorLineInterval?: number;
		minZoom?: number;
		maxZoom?: number;
		zoomSensitivity?: number;
		dampingFactor?: number;
		patternColor?: string;
		majorLineColor?: string;
		backgroundColor?: string;
		class?: string;
	};

	const {
		pattern = 'grid',
		gridSize = 40,
		dotRadius = 0.7,
		lineThickness = 0.5,
		majorDotRadius = 1.2,
		majorLineThickness = 1,
		majorLineInterval = 5,
		minZoom = 0.2,
		maxZoom = 8,
		zoomSensitivity = 0.0012,
		dampingFactor = 0.1,
		patternColor = 'hsl(var(--foreground) / 0.1)',
		majorLineColor,
		backgroundColor = 'hsl(var(--background))',
		class: additionalClasses = '',
	}: GridProps = $props();

	const finalMajorLineColor =
		majorLineColor ?? patternColor.replace(/[\d.]+\)$/, '0.2)');

	let canvasElement: HTMLCanvasElement | undefined = $state();
	let pan = $state({ x: 0, y: 0 });
	let zoom = $state(1);
	let panTarget = $state({ x: 0, y: 0 });
	let zoomTarget = $state(1);
	let isPanning = $state(false);
	let lastMousePosition = $state({ x: 0, y: 0 });
	let dimensions = $state({ width: 0, height: 0 });

	$effect(() => {
		if (!canvasElement) return;
		const ctx = canvasElement.getContext('2d');
		if (!ctx) return;

		const { width, height } = dimensions;
		ctx.fillStyle = backgroundColor;
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

		const startIndexX = Math.floor(view.x1 / gridSize);
		const startIndexY = Math.floor(view.y1 / gridSize);
		const endIndexX = Math.ceil(view.x2 / gridSize);
		const endIndexY = Math.ceil(view.y2 / gridSize);

		if (pattern === 'dots') {
			const scaledRadius = dotRadius / zoom;
			const scaledMajorRadius = majorDotRadius / zoom;
			const minorDots = new Path2D();
			const majorDots = new Path2D();

			for (let i = startIndexX; i <= endIndexX; i++) {
				for (let j = startIndexY; j <= endIndexY; j++) {
					const x = i * gridSize;
					const y = j * gridSize;
					const isMajor = i % majorLineInterval === 0 && j % majorLineInterval === 0;
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
			ctx.fillStyle = finalMajorLineColor;
			ctx.fill(majorDots);
		} else if (pattern === 'grid') {
			const minorLines = new Path2D();
			const majorLines = new Path2D();

			for (let i = startIndexX; i <= endIndexX; i++) {
				const x = i * gridSize;
				const isMajor = i % majorLineInterval === 0;
				const path = isMajor ? majorLines : minorLines;
				path.moveTo(x, view.y1);
				path.lineTo(x, view.y2);
			}
			for (let j = startIndexY; j <= endIndexY; j++) {
				const y = j * gridSize;
				const isMajor = j % majorLineInterval === 0;
				const path = isMajor ? majorLines : minorLines;
				path.moveTo(view.x1, y);
				path.lineTo(view.x2, y);
			}
			ctx.strokeStyle = patternColor;
			ctx.lineWidth = lineThickness / zoom;
			ctx.stroke(minorLines);
			ctx.strokeStyle = finalMajorLineColor;
			ctx.lineWidth = majorLineThickness / zoom;
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
		const zoomDelta = event.deltaY * zoomSensitivity;
		const newZoom = Math.max(minZoom, Math.min(maxZoom, zoomTarget - zoomDelta));
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
		if (!canvasElement) return;

		const resizeObserver = new ResizeObserver((entries) => {
			if (!entries[0]) return;
			const { width, height } = entries[0].contentRect;
			canvasElement.width = width;
			canvasElement.height = height;
			dimensions = { width, height };
		});
		resizeObserver.observe(canvasElement);

		const rect = canvasElement.getBoundingClientRect();
		canvasElement.width = rect.width;
		canvasElement.height = rect.height;
		dimensions = { width: rect.width, height: rect.height };

		const initialPan = { x: rect.width / 2, y: rect.height / 2 };
		pan = { ...initialPan };
		panTarget = { ...initialPan };

		let frameId: number;
		const animate = () => {
			const panDistance = Math.hypot(panTarget.x - pan.x, panTarget.y - pan.y);
			const zoomDistance = Math.abs(zoomTarget - zoom);

			if (panDistance > 0.01 || zoomDistance > 0.01) {
				pan.x += (panTarget.x - pan.x) * dampingFactor;
				pan.y += (panTarget.y - pan.y) * dampingFactor;
				zoom += (zoomTarget - zoom) * dampingFactor;
			} else {
				pan.x = panTarget.x;
				pan.y = panTarget.y;
				zoom = zoomTarget;
			}
			frameId = requestAnimationFrame(animate);
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
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:mouseleave={handleMouseUp}
	on:mousemove={handleMouseMove}
	on:dblclick={handleDoubleClick}
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