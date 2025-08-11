<script lang="ts">
	import { Rect, Line, Group } from 'svelte-konva';

	type HashedBackgroundProps = {
		width: number;
		height: number;
		fill?: string;
        classname?: string;
		strokeColor?: string;
		strokeWidth?: number;
		cornerRadius?: number;
		lineSpacing?: number;
		lineOpacity?: number;
		dashArray?: number[];
	};

	const {
		width,
		height,
		fill,
        classname,
		strokeColor = 'oklab(21% -.00316127 -.0338527/.1)',
		strokeWidth = 10,
		cornerRadius = 8,
		lineSpacing = 16,
		lineOpacity = 0.4,
		dashArray = [0],
	}: HashedBackgroundProps = $props();

	// Generate hashed pattern lines more efficiently
	let hashLines = $derived.by(() => {
		const lines: number[][] = [];
		const maxDimension = Math.max(width, height);
		const totalDistance = maxDimension * Math.sqrt(2);

		// Create diagonal lines at -45 degree angle (like CSS repeating-linear-gradient -45deg)
		for (let i = -totalDistance; i <= totalDistance; i += lineSpacing) {
			// Line equation: y = x + offset
			const offset = i;

			// Calculate intersection points with rectangle boundaries
			const points: [number, number][] = [];

			// Check intersection with left edge (x = 0)
			const yLeft = 0 + offset;
			if (yLeft >= 0 && yLeft <= height) points.push([0, yLeft]);

			// Check intersection with right edge (x = width)
			const yRight = width + offset;
			if (yRight >= 0 && yRight <= height) points.push([width, yRight]);

			// Check intersection with top edge (y = 0)
			const xTop = 0 - offset;
			if (xTop >= 0 && xTop <= width) points.push([xTop, 0]);

			// Check intersection with bottom edge (y = height)
			const xBottom = height - offset;
			if (xBottom >= 0 && xBottom <= width) points.push([xBottom, height]);

			// If we have exactly 2 intersection points, create a line
			if (points.length === 2) {
				lines.push([points[0][0], points[0][1], points[1][0], points[1][1]]);
			}
		}

		return lines;
	});
</script>

<Group>
	<!-- Base rectangle with solid background -->
	<Rect
		config={{
			width,
			height,
			fill: fill,
			stroke: strokeColor,
			strokeWidth,
			cornerRadius,
		}}
	/>

	<!-- Hashed pattern lines -->
	{#each hashLines as line}
		<Line
			config={{
				points: line,
				stroke: strokeColor,
				strokeWidth: 2,
				opacity: lineOpacity,
				lineCap: 'round'
			}}
		/>
	{/each}
</Group>

<style lang="postcss">
    @include glassmorphism;
	:global(.hashed-background) {
		-webkit-tap-highlight-color: transparent;
		-webkit-font-smoothing: antialiased;
        /* @layer glassmorphism; */
		/* fill: none; */
        

		width: 100%;
		height: 100%;
	}
</style>
