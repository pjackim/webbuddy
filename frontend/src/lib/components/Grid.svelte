<script lang="ts">
	// Zoom-aware, themeable world grid for canvas/stage backdrops
	// - Anchored in world space (origin at `offset`)
	// - Subtle by default, fades minor lines at low zoom
	// - Themeable via Tailwind CSS variables declared in app.css

	export let width: number = 0; // viewport width in px
	export let height: number = 0; // viewport height in px

	// View transform from world -> screen
	export let scale: number = 1; // world units -> px
	export let offset: { x: number; y: number } = { x: 0, y: 0 }; // screen px of world origin

	// Grid geometry
	export let baseSize = 50; // world units between MAJOR lines
	export let subdivisions = 50; // minor lines per major cell

	// Visual pattern
	type Pattern = 'lines' | 'dots' | 'none';
	export let pattern: Pattern = 'lines';

	// Axes
	export let showAxes = true;
	export let axesStyle: 'solid' | 'dashed' = 'solid';
	export let axesCrosshair = true;
	export let axesCrosshairSize = 4; // px diameter

	// Behavior
	export let autoFade = false; // fade minor/major lines by zoom
	export let hairline = true; // attempt 0.5px hairlines on HiDPI
	export let vignette = false; // soft focus vignette overlay
	export let vignetteOpacity = 0.06; // 0..1

	// Theme-aware defaults (from app.css @theme tokens)
	export let colors = {
		minor: 'var(--color-border)',
		major: 'var(--color-muted-foreground)',
		axes: 'var(--color-primary)'
	};

	export let opacities = {
		minor: 0.08,
		major: 0.22,
		axes: 0.35
	};

	export let thickness = {
		minor: 1,
		major: 1.25,
		axes: 1.5
	};

	function modWrap(value: number, period: number): number {
		if (period === 0) return 0;
		const r = value % period;
		return r < 0 ? r + period : r;
	}

	function clamp(n: number, min: number, max: number) {
		return Math.max(min, Math.min(max, n));
	}

	// Derived lengths in screen pixels
	$: minorStepPx = (baseSize / Math.max(1, subdivisions)) * scale;
	$: majorStepPx = baseSize * scale;

	// Visibility thresholds to reduce noise at tiny zoom levels
	const MIN_VIS_PX = 6;
	$: minorVisible = minorStepPx >= MIN_VIS_PX;
	$: majorVisible = majorStepPx >= MIN_VIS_PX;

	// Auto-fade by zoom
	$: minorFade = autoFade ? clamp((minorStepPx - 6) / 24, 0, 1) : 1;
	$: majorFade = autoFade ? clamp((majorStepPx - 6) / 24, 0, 1) : 1;

	// Hairline support on HiDPI
	$: dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
	$: hairlineScale = hairline && dpr >= 2 ? 0.5 : 1;
	$: tMinor = thickness.minor * hairlineScale;
	$: tMajor = thickness.major * hairlineScale;
	$: tAxes = thickness.axes * hairlineScale;
	// Ensure gradient stripes are at least 1px so they render on all displays
	$: gMinor = Math.max(1, Math.round(tMinor));
	$: gMajor = Math.max(1, Math.round(tMajor));

	// Compute per-layer offsets so grid is anchored in world space (origin at offset)
	$: minorX = modWrap(offset.x, minorStepPx || 1);
	$: minorY = modWrap(offset.y, minorStepPx || 1);
	$: majorX = modWrap(offset.x, majorStepPx || 1);
	$: majorY = modWrap(offset.y, majorStepPx || 1);

	// Layer opacities
	$: minorOpacity = minorVisible ? opacities.minor * (autoFade ? minorFade : 1) : 0;
	$: majorOpacity = majorVisible ? opacities.major * (autoFade ? majorFade : 1) : 0;

	// Backgrounds for minor/major layers using currentColor
	$: minorBgImages =
		pattern === 'lines'
			? `repeating-linear-gradient(to right, currentColor 0px, currentColor ${gMinor}px, transparent ${gMinor}px, transparent ${Math.max(1, minorStepPx)}px), repeating-linear-gradient(to bottom, currentColor 0px, currentColor ${gMinor}px, transparent ${gMinor}px, transparent ${Math.max(1, minorStepPx)}px)`
			: pattern === 'dots'
			? `radial-gradient(currentColor ${Math.max(0.5, tMinor)}px, transparent ${Math.max(0.5, tMinor)}px)`
			: 'none';

	$: minorBgPositions =
		pattern === 'lines'
			? `${minorX}px 0px, 0px ${minorY}px`
			: pattern === 'dots'
			? `${minorX}px ${minorY}px`
			: '0px 0px';

	$: minorBgSizes =
		pattern === 'lines'
			? 'auto, auto'
			: pattern === 'dots'
			? `${Math.max(1, minorStepPx)}px ${Math.max(1, minorStepPx)}px`
			: 'auto';

	$: majorBgImages =
		pattern === 'lines'
			? `repeating-linear-gradient(to right, currentColor 0px, currentColor ${gMajor}px, transparent ${gMajor}px, transparent ${Math.max(1, majorStepPx)}px), repeating-linear-gradient(to bottom, currentColor 0px, currentColor ${gMajor}px, transparent ${gMajor}px, transparent ${Math.max(1, majorStepPx)}px)`
			: pattern === 'dots'
			? `radial-gradient(currentColor ${Math.max(0.75, tMajor)}px, transparent ${Math.max(0.75, tMajor)}px)`
			: 'none';

	$: majorBgPositions =
		pattern === 'lines'
			? `${majorX}px 0px, 0px ${majorY}px`
			: pattern === 'dots'
			? `${majorX}px ${majorY}px`
			: '0px 0px';

	$: majorBgSizes =
		pattern === 'lines'
			? 'auto, auto'
			: pattern === 'dots'
			? `${Math.max(1, majorStepPx)}px ${Math.max(1, majorStepPx)}px`
			: 'auto';

	// Axes positions (screen coords of world origin)
	$: axisXTop = offset.y; // horizontal axis (X) runs across at y = offset.y
	$: axisYLeft = offset.x; // vertical axis (Y) runs down at x = offset.x

	// In-viewport checks
	$: showAxisX = showAxes && axisXTop >= 0 && axisXTop <= height;
	$: showAxisY = showAxes && axisYLeft >= 0 && axisYLeft <= width;

	// Exposed helpers for snapping and transforms
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

{#if pattern !== 'none'}
	<!-- Minor lines/dots layer -->
	<div
		class="absolute inset-0 pointer-events-none"
		role="presentation"
		aria-hidden="true"
		style={`color:${colors.minor}; opacity:${minorOpacity}; background-image:${minorBgImages}; background-position:${minorBgPositions}; background-size:${minorBgSizes}; background-repeat:repeat;`}
	></div>

	<!-- Major lines/dots layer -->
	<div
		class="absolute inset-0 pointer-events-none"
		role="presentation"
		aria-hidden="true"
		style={`color:${colors.major}; opacity:${majorOpacity}; background-image:${majorBgImages}; background-position:${majorBgPositions}; background-size:${majorBgSizes}; background-repeat:repeat;`}
	></div>
{/if}

{#if showAxes}
	{#if showAxisX}
		<div
			class="absolute left-0 right-0 pointer-events-none"
			style={`top:${axisXTop}px; border-top:${tAxes}px ${axesStyle} currentColor; color:${colors.axes}; opacity:${opacities.axes};`}
			aria-hidden="true"
		></div>
	{/if}
	{#if showAxisY}
		<div
			class="absolute top-0 bottom-0 pointer-events-none"
			style={`left:${axisYLeft}px; border-left:${tAxes}px ${axesStyle} currentColor; color:${colors.axes}; opacity:${opacities.axes};`}
			aria-hidden="true"
		></div>
	{/if}
	{#if axesCrosshair && showAxisX && showAxisY}
		<div
			class="absolute pointer-events-none rounded-full"
			style={`left:${axisYLeft - axesCrosshairSize / 2}px; top:${axisXTop - axesCrosshairSize / 2}px; width:${axesCrosshairSize}px; height:${axesCrosshairSize}px; background:currentColor; color:${colors.axes}; opacity:${opacities.axes}; outline:1px solid var(--color-background);`}
			aria-hidden="true"
		></div>
	{/if}
{/if}

{#if vignette}
	<div
		class="absolute inset-0 pointer-events-none"
		style={`opacity:${clamp(vignetteOpacity, 0, 1)}; background: radial-gradient(ellipse at center, transparent 55%, var(--color-background) 100%);`}
		aria-hidden="true"
	></div>
{/if}

<style>
	:global(.grid-root) {
		/* reserved if parent wants to assign a class */
	}
</style>
