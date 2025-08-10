<script lang="ts">
	import { Text as KText } from 'svelte-konva';
	import { online, upsertAsset } from '../../stores';
	import { api } from '../../api';
	import type { KonvaMouseEvent } from 'svelte-konva';

	export let a: any; // TextAsset
	let isDragging = $state(false);
	let start = $state({ x: 0, y: 0 });
	let orig = $state({ x: 0, y: 0 });

	function onDown(e: KonvaMouseEvent) {
		isDragging = true;
		const { evt } = e.detail;
		start = { x: evt.clientX, y: evt.clientY };
		orig = { x: a.x, y: a.y };
	}
	function onMove(e: KonvaMouseEvent) {
		if (!isDragging) return;
		const { evt } = e.detail;
		const dx = evt.clientX - start.x;
		const dy = evt.clientY - start.y;
		a = { ...a, x: orig.x + dx, y: orig.y + dy };
	}
	async function onUp() {
		isDragging = false;
		upsertAsset(a);
		if (online.current)
			await api(`/assets/${a.id}`, { method: 'PUT', body: JSON.stringify({ x: a.x, y: a.y }) });
	}
</script>

<KText
	config={{
		text: a.text,
		x: a.x,
		y: a.y,
		fontSize: a.font_size,
		fill: a.color
	}}
	on:mousedown={onDown}
	on:mousemove={onMove}
	on:mouseup={onUp}
/>
