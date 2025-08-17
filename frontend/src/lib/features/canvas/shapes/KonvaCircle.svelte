<script lang="ts">
	import { Circle } from 'svelte-konva';
	import type { ComponentProps } from 'svelte';

	interface KonvaCircleProps {
		/** X position of the circle center */
		x?: number;
		/** Y position of the circle center */
		y?: number;
		/** Radius of the circle */
		radius?: number;
		/** Fill color */
		fill?: string;
		/** Stroke color */
		stroke?: string;
		/** Stroke width */
		strokeWidth?: number;
		/** Whether the circle is draggable */
		draggable?: boolean;
		/** Custom configuration object */
		config?: ComponentProps<Circle>['config'];
		/** Event handlers */
		onclick?: (e: CustomEvent) => void;
		onmouseenter?: (e: CustomEvent) => void;
		onmouseleave?: (e: CustomEvent) => void;
		ondragstart?: (e: CustomEvent) => void;
		ondragend?: (e: CustomEvent) => void;
	}

	const {
		x = 150,
		y = 150,
		radius = 50,
		fill = '#10b981',
		stroke = '#059669',
		strokeWidth = 2,
		draggable = true,
		config = {},
		onclick,
		onmouseenter,
		onmouseleave,
		ondragstart,
		ondragend,
		...restProps
	}: KonvaCircleProps = $props();

	// Handle reference to the underlying Konva node
	let handle = $state<any>();

	// Merge default config with custom config
	const mergedConfig = $derived({
		x,
		y,
		radius,
		fill,
		stroke,
		strokeWidth,
		draggable,
		...config
	});

	// Export the handle for parent components
	function getHandle() {
		return handle;
	}

	// Expose useful methods
	const konvaCircle = {
		getHandle,
		moveTo: (newX: number, newY: number) => {
			if (handle) {
				handle.x(newX);
				handle.y(newY);
				handle.getLayer()?.batchDraw();
			}
		},
		resize: (newRadius: number) => {
			if (handle) {
				handle.radius(newRadius);
				handle.getLayer()?.batchDraw();
			}
		},
		changeColor: (newFill: string) => {
			if (handle) {
				handle.fill(newFill);
				handle.getLayer()?.batchDraw();
			}
		}
	};
</script>

<Circle
	bind:handle={handle}
	config={mergedConfig}
	on:pointerclick={onclick}
	on:pointerenter={onmouseenter}
	on:pointerleave={onmouseleave}
	on:dragstart={ondragstart}
	on:dragend={ondragend}
	{...restProps}
/>