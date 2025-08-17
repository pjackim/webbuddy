<script lang="ts">
	import { Rect } from 'svelte-konva';
	import type { ComponentProps } from 'svelte';

	interface KonvaRectangleProps {
		/** X position of the rectangle */
		x?: number;
		/** Y position of the rectangle */
		y?: number;
		/** Width of the rectangle */
		width?: number;
		/** Height of the rectangle */
		height?: number;
		/** Fill color */
		fill?: string;
		/** Stroke color */
		stroke?: string;
		/** Stroke width */
		strokeWidth?: number;
		/** Whether the rectangle is draggable */
		draggable?: boolean;
		/** Custom configuration object */
		config?: ComponentProps<Rect>['config'];
		/** Event handlers */
		onclick?: (e: CustomEvent) => void;
		onmouseenter?: (e: CustomEvent) => void;
		onmouseleave?: (e: CustomEvent) => void;
		ondragstart?: (e: CustomEvent) => void;
		ondragend?: (e: CustomEvent) => void;
	}

	const {
		x = 100,
		y = 100,
		width = 100,
		height = 100,
		fill = '#3b82f6',
		stroke = '#1e40af',
		strokeWidth = 2,
		draggable = true,
		config = {},
		onclick,
		onmouseenter,
		onmouseleave,
		ondragstart,
		ondragend,
		...restProps
	}: KonvaRectangleProps = $props();

	// Handle reference to the underlying Konva node
	let handle = $state<any>();

	// Merge default config with custom config
	const mergedConfig = $derived({
		x,
		y,
		width,
		height,
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
	const konvaRect = {
		getHandle,
		moveTo: (newX: number, newY: number) => {
			if (handle) {
				handle.x(newX);
				handle.y(newY);
				handle.getLayer()?.batchDraw();
			}
		},
		resize: (newWidth: number, newHeight: number) => {
			if (handle) {
				handle.width(newWidth);
				handle.height(newHeight);
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

<Rect
	bind:handle={handle}
	config={mergedConfig}
	on:pointerclick={onclick}
	on:pointerenter={onmouseenter}
	on:pointerleave={onmouseleave}
	on:dragstart={ondragstart}
	on:dragend={ondragend}
	{...restProps}
/>