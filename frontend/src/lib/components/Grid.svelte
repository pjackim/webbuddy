<script lang="ts">
	// Highly-configurable, zoom-aware world grid
	// Designed to be placed as the last layer before the viewport background.
	// Use absolute positioning (in parent) and pointer-events: none to keep it non-interactive.

	export let width: number = 0; // viewport width in px
	export let height: number = 0; // viewport height in px

	// View transform from world -> screen (same semantics as Stage config)
	export let scale: number = 1; // world units -> px
	export let offset: { x: number; y: number } = { x: 0, y: 0 }; // screen px of world origin

	// Grid configuration
	export let baseSize = 50; // world units between MAJOR lines
	export let subdivisions = 50; // minor lines per major cell

	export let colors = {
		minor: '#6b7280', // tailwind gray-500
		major: '#9ca3af', // tailwind gray-400
		axes: '#22d3ee' // tailwind cyan-400
	};

	export let opacities = {
		minor: 0.05,
		major: 0.08,
		axes: 0.2
	};

	export let thickness = {
		minor: 1,
		major: 1,
		axes: 1.5
	};

	export let showAxes = true;

	// Helpers
	function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
		const m = hex.replace('#', '').trim();
		if (m.length === 3) {
			const r = parseInt(m[0] + m[0], 16);
			const g = parseInt(m[1] + m[1], 16);
			const b = parseInt(m[2] + m[2], 16);
			return { r, g, b };
		}
		if (m.length === 6) {
			const r = parseInt(m.slice(0, 2), 16);
			const g = parseInt(m.slice(2, 4), 16);
			const b = parseInt(m.slice(4, 6), 16);
			return { r, g, b };
		}
		return null;
	}

	function withAlpha(color: string, a: number): string {
		const rgb = hexToRgb(color);
		if (rgb) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
		// Fallback for named/rgb/hsl inputs: use color-mix if available
		const pct = Math.round(a * 100);
		return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
	}

	function modWrap(value: number, period: number): number {
		if (period === 0) return 0;
		const r = value % period;
		return r < 0 ? r + period : r;
	}

	// Derived lengths in screen pixels
	$: minorStepPx = (baseSize / Math.max(1, subdivisions)) * scale;
	$: majorStepPx = baseSize * scale;

	// Visibility thresholds to reduce noise at tiny zoom levels
	const MIN_VIS_PX = 6;
	$: minorVisible = minorStepPx >= MIN_VIS_PX;
	$: majorVisible = majorStepPx >= MIN_VIS_PX;

	// Compute per-layer offsets so grid is anchored in world space (origin at offset)
	$: minorX = modWrap(offset.x, minorStepPx || 1);
	$: minorY = modWrap(offset.y, minorStepPx || 1);
	$: majorX = modWrap(offset.x, majorStepPx || 1);
	$: majorY = modWrap(offset.y, majorStepPx || 1);

	// Colors with opacity
	$: minorRGBA = withAlpha(colors.minor, opacities.minor);
	$: majorRGBA = withAlpha(colors.major, opacities.major);
	$: axesRGBA = withAlpha(colors.axes, opacities.axes);

	// Build the layered repeating-linear-gradient background
	// 4 layers: minor-x, minor-y, major-x, major-y
	$: bgImages = [
		// minor vertical lines (to right)
		`repeating-linear-gradient(to right, ${minorVisible ? minorRGBA : 'transparent'} 0px, ${minorVisible ? minorRGBA : 'transparent'} ${minorVisible ? thickness.minor : 0}px, transparent ${minorVisible ? thickness.minor : 0}px, transparent ${Math.max(1, minorStepPx)}px)`,
		// minor horizontal lines (to bottom)
		`repeating-linear-gradient(to bottom, ${minorVisible ? minorRGBA : 'transparent'} 0px, ${minorVisible ? minorRGBA : 'transparent'} ${minorVisible ? thickness.minor : 0}px, transparent ${minorVisible ? thickness.minor : 0}px, transparent ${Math.max(1, minorStepPx)}px)`,
		// major vertical lines
		`repeating-linear-gradient(to right, ${majorVisible ? majorRGBA : 'transparent'} 0px, ${majorVisible ? majorRGBA : 'transparent'} ${majorVisible ? thickness.major : 0}px, transparent ${majorVisible ? thickness.major : 0}px, transparent ${Math.max(1, majorStepPx)}px)`,
		// major horizontal lines
		`repeating-linear-gradient(to bottom, ${majorVisible ? majorRGBA : 'transparent'} 0px, ${majorVisible ? majorRGBA : 'transparent'} ${majorVisible ? thickness.major : 0}px, transparent ${majorVisible ? thickness.major : 0}px, transparent ${Math.max(1, majorStepPx)}px)`
	].join(', ');

	// layer-aligned positions
	$: bgPositions = [
		`${minorX}px 0px`,
		`0px ${minorY}px`,
		`${majorX}px 0px`,
		`0px ${majorY}px`
	].join(', ');

	// Axes positions (screen coords of world origin)
	$: axisXTop = offset.y; // horizontal axis (X) runs across at y = offset.y
	$: axisYLeft = offset.x; // vertical axis (Y) runs down at x = offset.x

	// In-viewport checks
	$: showAxisX = showAxes && axisXTop >= 0 && axisXTop <= height;
	$: showAxisY = showAxes && axisYLeft >= 0 && axisYLeft <= width;

	// Exposed helpers for future snapping (can be used via bind:this)
	export function nearestSnap(point: { x: number; y: number }, stepWorld?: number) {
		const step = stepWorld ?? (subdivisions > 0 ? baseSize / subdivisions : baseSize);
		const sx = Math.round(point.x / step) * step;
		const sy = Math.round(point.y / step) * step;
		return { x: sx, y: sy };
	}

	export function worldToScreen(p: { x: number; y: number }) {
		return { x: p.x * scale + offset.x, y: p.y * scale + offset.y };
	}

	export function screenToWorld(p: { x: number; y: number }) {
		return { x: (p.x - offset.x) / scale, y: (p.y - offset.y) / scale };
	}
</script>

<!-- Grid -->
<div
	class="absolute inset-0 pointer-events-none"
	role="presentation"
	aria-hidden="true"
	style={`background-image: ${bgImages}; background-position: ${bgPositions}; background-repeat: repeat;`}
	></div>

{#if showAxes}
	{#if showAxisX}
		<div
			class="absolute left-0 right-0 pointer-events-none"
			style={`top:${axisXTop}px; border-top:${thickness.axes}px solid ${axesRGBA};`}
			aria-hidden="true"
		></div>
	{/if}
	{#if showAxisY}
		<div
			class="absolute top-0 bottom-0 pointer-events-none"
			style={`left:${axisYLeft}px; border-left:${thickness.axes}px solid ${axesRGBA};`}
			aria-hidden="true"
		></div>
	{/if}
	{#if showAxisX && showAxisY}
		<div
			class="absolute pointer-events-none rounded-full"
			style={`left:${axisYLeft - 2}px; top:${axisXTop - 2}px; width:4px; height:4px; background:${axesRGBA};`}
			aria-hidden="true"
		></div>
	{/if}
{/if}

<style>
	:global(.grid-root) {
		/* reserved if parent wants to assign a class */
	}
</style>
