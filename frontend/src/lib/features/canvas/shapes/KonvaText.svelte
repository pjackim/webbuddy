<script lang="ts">
	import { Text } from 'svelte-konva';
	import type { ComponentProps } from 'svelte';

	interface KonvaTextProps {
		/** X position of the text */
		x?: number;
		/** Y position of the text */
		y?: number;
		/** Text content */
		text?: string;
		/** Font size */
		fontSize?: number;
		/** Font family */
		fontFamily?: string;
		/** Font weight */
		fontStyle?: string;
		/** Text color */
		fill?: string;
		/** Stroke color */
		stroke?: string;
		/** Stroke width */
		strokeWidth?: number;
		/** Text alignment */
		align?: 'left' | 'center' | 'right';
		/** Whether the text is draggable */
		draggable?: boolean;
		/** Text width (for wrapping) */
		width?: number;
		/** Custom configuration object */
		config?: ComponentProps<Text>['config'];
		/** Event handlers */
		onclick?: (e: CustomEvent) => void;
		onmouseenter?: (e: CustomEvent) => void;
		onmouseleave?: (e: CustomEvent) => void;
		ondragstart?: (e: CustomEvent) => void;
		ondragend?: (e: CustomEvent) => void;
		ondblclick?: (e: CustomEvent) => void;
	}

	const {
		x = 200,
		y = 200,
		text = 'Sample Text',
		fontSize = 16,
		fontFamily = 'Arial',
		fontStyle = 'normal',
		fill = '#374151',
		stroke = '',
		strokeWidth = 0,
		align = 'left',
		draggable = true,
		width,
		config = {},
		onclick,
		onmouseenter,
		onmouseleave,
		ondragstart,
		ondragend,
		ondblclick,
		...restProps
	}: KonvaTextProps = $props();

	// Handle reference to the underlying Konva node
	let handle = $state<any>();

	// Merge default config with custom config
	const mergedConfig = $derived({
		x,
		y,
		text,
		fontSize,
		fontFamily,
		fontStyle,
		fill,
		stroke,
		strokeWidth,
		align,
		draggable,
		...(width ? { width } : {}),
		...config
	});

	// Export the handle for parent components
	function getHandle() {
		return handle;
	}

	// Expose useful methods
	const konvaText = {
		getHandle,
		moveTo: (newX: number, newY: number) => {
			if (handle) {
				handle.x(newX);
				handle.y(newY);
				handle.getLayer()?.batchDraw();
			}
		},
		changeText: (newText: string) => {
			if (handle) {
				handle.text(newText);
				handle.getLayer()?.batchDraw();
			}
		},
		changeFontSize: (newFontSize: number) => {
			if (handle) {
				handle.fontSize(newFontSize);
				handle.getLayer()?.batchDraw();
			}
		},
		changeColor: (newFill: string) => {
			if (handle) {
				handle.fill(newFill);
				handle.getLayer()?.batchDraw();
			}
		},
		changeFont: (newFontFamily: string) => {
			if (handle) {
				handle.fontFamily(newFontFamily);
				handle.getLayer()?.batchDraw();
			}
		}
	};
</script>

<Text
	bind:handle={handle}
	config={mergedConfig}
	on:pointerclick={onclick}
	on:pointerenter={onmouseenter}
	on:pointerleave={onmouseleave}
	on:dragstart={ondragstart}
	on:dragend={ondragend}
	on:pointerdblclick={ondblclick}
	{...restProps}
/>