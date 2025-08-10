<script lang="ts">
	import type { Screen, Asset } from '../stores';
	import { Group, Rect, Text as KText } from 'svelte-konva';
	import ImageAsset from './assets/ImageAsset.svelte';
	import TextAsset from './assets/TextAsset.svelte';
	import { assets, assetsByScreen, online, upsertAsset } from '../stores';
	import { api } from '../api';
	import { onMount } from 'svelte';

	export let sc: Screen;
	let myAssets: Asset[] = [];

	async function load() {
		const list = await api(`/assets?screen_id=${sc.id}`);
		for (const a of list) upsertAsset(a);
	}

	$: myAssets = $assetsByScreen.get(sc.id) || [];

	// Drag the whole screen in canvas (moves its x,y)
	let dragging = false;
	let start = { x: 0, y: 0 };
	let orig = { x: 0, y: 0 };
	function onScreenDown(e) {
		dragging = true;
		start = { x: e.evt.clientX, y: e.evt.clientY };
		orig = { x: sc.x, y: sc.y };
	}
	function onScreenMove(e) {
		if (!dragging) return;
		const dx = e.evt.clientX - start.x;
		const dy = e.evt.clientY - start.y;
		sc = { ...sc, x: orig.x + dx, y: orig.y + dy };
	}
	function onScreenUp() {
		dragging = false;
		if ($online)
			api(`/screens/${sc.id}`, { method: 'PUT', body: JSON.stringify({ x: sc.x, y: sc.y }) });
	}

	onMount(load);
</script>

<Group
	x={sc.x}
	y={sc.y}
	on:mousedown={onScreenDown}
	on:mouseup={onScreenUp}
	on:mousemove={onScreenMove}
>
	<Rect
		width={sc.width}
		height={sc.height}
		fill="#222"
		stroke="#555"
		strokeWidth={2}
		cornerRadius={8}
	/>
	<KText text={`${sc.name} (${sc.width}×${sc.height})`} fill="#aaa" fontSize={16} x={8} y={8} />
	{#each myAssets as a (a.id)}
		{#if a.type === 'image'}
			<ImageAsset {a} />
		{:else}
			<TextAsset {a} />
		{/if}
	{/each}
</Group>
