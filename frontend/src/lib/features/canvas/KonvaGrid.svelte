<script lang="ts">
	import { Group, Line } from 'svelte-konva';

	type GridProps = {
		scale: number;
		offset: { x: number; y: number };
		viewport: { width: number; height: number };
		gridSize?: number;
		majorLineInterval?: number;
		lineColor?: string;
		majorLineColor?: string;
		lineOpacity?: number;
		majorLineOpacity?: number;
	};

	const {
		scale,
		offset,
		viewport,
		gridSize = 20,
		majorLineInterval = 10,
		lineColor = '#1e293b',
		majorLineColor = '#334155',
		lineOpacity = 0.3,
		majorLineOpacity = 0.5
	}: GridProps = $props();

	let gridLines = $derived.by(() => {
		if (!viewport.width || !viewport.height) return { minor: [], major: [] };

		// Calculate the visible area in world coordinates
		const worldBounds = {
			left: -offset.x / scale,
			top: -offset.y / scale,
			right: (viewport.width - offset.x) / scale,
			bottom: (viewport.height - offset.y) / scale
		};

		// Calculate grid line positions
		const minorLines: number[][] = [];
		const majorLines: number[][] = [];

		// Vertical lines
		const startX = Math.floor(worldBounds.left / gridSize) * gridSize;
		const endX = Math.ceil(worldBounds.right / gridSize) * gridSize;

		for (let x = startX; x <= endX; x += gridSize) {
			const isMajor = (x / gridSize) % majorLineInterval === 0;
			const line = [x, worldBounds.top, x, worldBounds.bottom];

			if (isMajor) {
				majorLines.push(line);
			} else {
				minorLines.push(line);
			}
		}

		// Horizontal lines
		const startY = Math.floor(worldBounds.top / gridSize) * gridSize;
		const endY = Math.ceil(worldBounds.bottom / gridSize) * gridSize;

		for (let y = startY; y <= endY; y += gridSize) {
			const isMajor = (y / gridSize) % majorLineInterval === 0;
			const line = [worldBounds.left, y, worldBounds.right, y];

			if (isMajor) {
				majorLines.push(line);
			} else {
				minorLines.push(line);
			}
		}

		return { minor: minorLines, major: majorLines };
	});

	// Keep lines very thin and subtle like the reference
	let strokeWidth = $derived(Math.max(0.3, 0.5 / scale));
	let majorStrokeWidth = $derived(Math.max(0.5, 0.8 / scale));

	// Subtle fade behavior - less dramatic than before
	let dynamicOpacity = $derived(Math.min(1, Math.max(0.4, scale * 1.5)));
	let finalLineOpacity = $derived(lineOpacity * dynamicOpacity);
	let finalMajorOpacity = $derived(majorLineOpacity * dynamicOpacity);
</script>

<Group>
	<!-- Minor grid lines -->
	{#each gridLines.minor as line}
		<Line
			config={{
				points: line,
				stroke: lineColor,
				strokeWidth: strokeWidth,
				opacity: finalLineOpacity
			}}
		/>
	{/each}

	<!-- Major grid lines -->
	{#each gridLines.major as line}
		<Line
			config={{
				points: line,
				stroke: majorLineColor,
				strokeWidth: majorStrokeWidth,
				opacity: finalMajorOpacity
			}}
		/>
	{/each}
</Group>
