<script lang="ts">
	import type { Screen, Asset } from '../stores';
	import { Group, Rect, Text as KText } from 'svelte-konva';
	import ImageAsset from './assets/ImageAsset.svelte';
	import TextAsset from './assets/TextAsset.svelte';
	import { assets, assetsByScreen, online, upsertAsset } from '../stores';
	import { api } from '../api';
	import { onMount } from 'svelte';
	import type Konva from 'konva';
	import type { KonvaMouseEvent } from 'svelte-konva';

	export let sc: Screen;
	let myAssets = $derived($assetsByScreen.get(sc.id) || []);

	async function load() {
		const list: Asset[] = await api<Asset[]>(`/assets?screen_id=${sc.id}`);
		for (const a of list) upsertAsset(a);
	}

	// Drag the whole screen in canvas (moves its x,y)
	let dragging = $state(false);
	let start = $state({ x: 0, y: 0 });
	let orig = $state({ x: 0, y: 0 });
	function onScreenDown(e: KonvaMouseEvent) {
		dragging = true;
		const { evt } = e.detail;
		start = { x: evt.clientX, y: evt.clientY };
		orig = { x: sc.x, y: sc.y };
	}
	function onScreenMove(e: KonvaMouseEvent) {
		if (!dragging) return;
		const { evt } = e.detail;
		const dx = evt.clientX - start.x;
		const dy = evt.clientY - start.y;
		sc = { ...sc, x: orig.x + dx, y: orig.y + dy };
	}
	function onScreenUp(_e: KonvaMouseEvent) {
		dragging = false;
		if (online.current)
			api(`/screens/${sc.id}`, { method: 'PUT', body: JSON.stringify({ x: sc.x, y: sc.y }) });
	}

	onMount(load);
</script>

<Group
	config={{ x: sc.x, y: sc.y }}
	on:mousedown={onScreenDown}
	on:mouseup={onScreenUp}
	on:mousemove={onScreenMove}
>
	<Rect
		config={{
			width: sc.width,
			height: sc.height,
			fill: '#222',
			stroke: '#555',
			strokeWidth: 2,
			cornerRadius: 8
		}}
	/>
	<KText
		config={{
			text: `${sc.name} (${sc.width}×${sc.height})`,
			fill: '#aaa',
			fontSize: 16,
			x: 8,
			y: 8
		}}
	/>
	{#each myAssets as a (a.id)}
		{#if a.type === 'image'}
			<ImageAsset {a} />
		{:else}
			<TextAsset {a} />
		{/if}
	{/each}
</Group>
