<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Stage, Layer } from 'svelte-konva';
	import ScreenFrame from './ScreenFrame.svelte';
	import KonvaGrid from './KonvaGrid.svelte';
	import { KonvaRectangle, KonvaCircle, KonvaText } from './shapes';
	import { screens, setScreens, selectedTool, toolSettings } from '$lib/stores';
	import type { Screen as StoreScreen, ToolType } from '$lib/stores';
	import { api } from '$lib/api';
	import { connectWS } from '$lib/ws';

    type CanvasProps = {
        initialScale?: number;
        minScale?: number;
        maxScale?: number;
        showGrid?: boolean;
    };

    const {
        initialScale = 0.5,
        minScale = 0.1,
        maxScale = 3,
        showGrid = true
    }: CanvasProps = $props();

    let scale = $state(initialScale);
	let offset = $state({ x: 0, y: 0 });
    let panning = $state(false);
    let allowPan = $state(false); // hold Space or use middle mouse
	let last = { x: 0, y: 0 };
	let container: HTMLElement;
	let viewport = $state({ width: 0, height: 0 });
    let gridEnabled = $state(showGrid);

	// Shape management
	interface CanvasShape {
		id: string;
		type: 'rectangle' | 'circle' | 'text';
		x: number;
		y: number;
		props: any;
	}

	let shapes = $state<CanvasShape[]>([]);
	let nextShapeId = $state(1);

	async function load() {
		try {
			const sc = await api('/screens');
			setScreens(sc as StoreScreen[]);
			const all = await api('/assets');
			// assets store filled indirectly in ScreenFrame via events or do it here if preferred
			// We'll broadcast on initial GET too for simplicity: update locally
			// but to keep simple, ScreenFrame will fetch per screen.
		} catch (error) {
			// Backend not available, continue without data
			console.warn('Backend not available, running without screen data');
			setScreens([]);
		}
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
        const newScale = Math.max(minScale, Math.min(maxScale, scale * (direction > 0 ? factor : 1 / factor)));

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
        
		// Check if we should create a shape
		let currentTool: ToolType = 'pointer';
		selectedTool.subscribe(tool => currentTool = tool)();
		
		if (currentTool !== 'pointer' && currentTool !== 'eraser' && !allowPan && e.button === 0) {
			createShape(e);
			return;
		}

        // enable pan with Space key or middle mouse button
        if (!allowPan && e.button !== 1) return;
        panning = true;
		last = { x: e.clientX, y: e.clientY };
	}

	function onStagePointerDown(e: CustomEvent) {
		// Check if we should create a shape
		let currentTool: ToolType = 'pointer';
		selectedTool.subscribe(tool => currentTool = tool)();
		
		if (currentTool !== 'pointer' && currentTool !== 'eraser' && !allowPan) {
			createShapeFromKonvaEvent(e);
			return;
		}
	}

	function createShapeFromKonvaEvent(e: CustomEvent) {
		const konvaEvent = e.detail;
		const stage = konvaEvent.target.getStage();
		if (!stage) return;

		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		// Convert screen coordinates to stage coordinates
		const stageX = (pointer.x - offset.x) / scale;
		const stageY = (pointer.y - offset.y) / scale;

		let currentTool: ToolType = 'pointer';
		selectedTool.subscribe(tool => currentTool = tool)();
		
		let settings: any = {};
		toolSettings.subscribe(s => settings = s)();

		let newShape: CanvasShape | null = null;

		switch (currentTool) {
			case 'rectangle':
				newShape = {
					id: `rect-${nextShapeId++}`,
					type: 'rectangle',
					x: stageX,
					y: stageY,
					props: {
						width: settings.rectangle.width,
						height: settings.rectangle.height,
						fill: settings.rectangle.fill,
						stroke: settings.rectangle.stroke,
						strokeWidth: settings.rectangle.strokeWidth
					}
				};
				break;
			case 'circle':
				newShape = {
					id: `circle-${nextShapeId++}`,
					type: 'circle',
					x: stageX,
					y: stageY,
					props: {
						radius: settings.circle.radius,
						fill: settings.circle.fill,
						stroke: settings.circle.stroke,
						strokeWidth: settings.circle.strokeWidth
					}
				};
				break;
			case 'text':
				newShape = {
					id: `text-${nextShapeId++}`,
					type: 'text',
					x: stageX,
					y: stageY,
					props: {
						text: settings.text.text,
						fontSize: settings.text.fontSize,
						fontFamily: settings.text.fontFamily,
						fill: settings.text.fill,
						stroke: settings.text.stroke,
						strokeWidth: settings.text.strokeWidth
					}
				};
				break;
		}

		if (newShape) {
			shapes = [...shapes, newShape];
		}
	}

	function createShape(e: MouseEvent) {
		const stage = e.currentTarget as any;
		if (!stage || !stage.getPointerPosition) return;

		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		// Convert screen coordinates to stage coordinates
		const stageX = (pointer.x - offset.x) / scale;
		const stageY = (pointer.y - offset.y) / scale;

		let currentTool: ToolType = 'pointer';
		selectedTool.subscribe(tool => currentTool = tool)();
		
		let settings: any = {};
		toolSettings.subscribe(s => settings = s)();

		let newShape: CanvasShape | null = null;

		switch (currentTool) {
			case 'rectangle':
				newShape = {
					id: `rect-${nextShapeId++}`,
					type: 'rectangle',
					x: stageX,
					y: stageY,
					props: {
						width: settings.rectangle.width,
						height: settings.rectangle.height,
						fill: settings.rectangle.fill,
						stroke: settings.rectangle.stroke,
						strokeWidth: settings.rectangle.strokeWidth
					}
				};
				break;
			case 'circle':
				newShape = {
					id: `circle-${nextShapeId++}`,
					type: 'circle',
					x: stageX,
					y: stageY,
					props: {
						radius: settings.circle.radius,
						fill: settings.circle.fill,
						stroke: settings.circle.stroke,
						strokeWidth: settings.circle.strokeWidth
					}
				};
				break;
			case 'text':
				newShape = {
					id: `text-${nextShapeId++}`,
					type: 'text',
					x: stageX,
					y: stageY,
					props: {
						text: settings.text.text,
						fontSize: settings.text.fontSize,
						fontFamily: settings.text.fontFamily,
						fill: settings.text.fill,
						stroke: settings.text.stroke,
						strokeWidth: settings.text.strokeWidth
					}
				};
				break;
		}

		if (newShape) {
			shapes = [...shapes, newShape];
		}
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

    function onKeyDown(e: KeyboardEvent) {
        if (e.code === 'Space') {
            allowPan = true;
        }
    }
    function onKeyUp(e: KeyboardEvent) {
        if (e.code === 'Space') {
            allowPan = false;
        }
    }

    function resetView() {
        scale = initialScale;
		offset = {
			x: viewport.width / 2,
			y: (viewport.height - 64) / 2
		};
	}

	function toggleGrid() {
		gridEnabled = !gridEnabled;
	}

	onMount(() => {
		try {
			connectWS();
		} catch (error) {
			console.warn('WebSocket connection failed, continuing without real-time updates');
		}
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

			const onKeyControls = (e: KeyboardEvent) => {
				if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
					toggleGrid();
				} else if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
					resetView();
				}
			};
			window.addEventListener('keydown', onKeyControls);
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
			return () => {
				window.removeEventListener('resize', updateViewport);
				window.removeEventListener('keydown', onKeyControls);
                window.removeEventListener('keydown', onKeyDown);
                window.removeEventListener('keyup', onKeyUp);
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

<section
	class="relative w-full h-full glassmorphism canvas-container"
	bind:this={container}
	aria-label="Canvas area"
	class:cursor-grab={allowPan && !panning}
	class:cursor-grabbing={panning}
>
	<Stage
		config={{
			width: viewport.width,
			height: viewport.height,
			scaleX: scale,
			scaleY: scale,
			x: offset.x,
			y: offset.y
		}}
		on:pointerdown={onStagePointerDown}
	>
		<!-- Grid layer (behind everything) -->
		{#if gridEnabled}
			<Layer>
				<KonvaGrid {scale} {offset} {viewport} />
			</Layer>
		{/if}

		<!-- Main content layer -->
		<Layer>
			{#each screens() as sc}
				<ScreenFrame {sc} />
			{/each}
		</Layer>

		<!-- Shapes layer -->
		<Layer>
			{#each shapes as shape (shape.id)}
				{#if shape.type === 'rectangle'}
					<KonvaRectangle
						x={shape.x}
						y={shape.y}
						{...shape.props}
					/>
				{:else if shape.type === 'circle'}
					<KonvaCircle
						x={shape.x}
						y={shape.y}
						{...shape.props}
					/>
				{:else if shape.type === 'text'}
					<KonvaText
						x={shape.x}
						y={shape.y}
						{...shape.props}
					/>
				{/if}
			{/each}
		</Layer>
	</Stage>

    <div class="absolute bottom-4 left-4 flex gap-2 z-20">
		<button
			class="px-3 py-1 bg-background/80 border rounded text-sm hover:bg-muted"
			style="backdrop-filter: blur(8px);"
			onclick={toggleGrid}
		>
			{gridEnabled ? 'Hide Grid' : 'Show Grid'} (G)
		</button>
		<button
			class="px-3 py-1 bg-background/80 border rounded text-sm hover:bg-muted"
			style="backdrop-filter: blur(8px);"
			onclick={resetView}
		>
			Reset View (R)
		</button>
		<div
			class="px-3 py-1 bg-background/80 border rounded text-sm"
			style="backdrop-filter: blur(8px);"
		>
			Zoom: {Math.round(scale * 100)}%
		</div>
        <div class="px-2 py-1 text-xs text-muted-foreground select-none" style="backdrop-filter: blur(8px);">
            Hold Space or use Middle Mouse to pan
        </div>
	</div>
</section>
