<script lang="ts">
	import type { Screen, Asset } from '$lib/stores';
	import { Group, Rect, Text as KText } from 'svelte-konva';
	import ImageAsset from './assets/ImageAsset.svelte';
	import TextAsset from './assets/TextAsset.svelte';
	import HashedBackground from './HashedBackground.svelte';
	import { assetsByScreen, online, upsertAsset, upsertScreen } from '$lib/stores';
	import { api } from '$lib/api';
	import { onMount } from 'svelte';
	import type { KonvaMouseEvent } from 'svelte-konva';

	let { sc }: { sc: Screen } = $props();
	let myAssets: Asset[] = $derived(assetsByScreen().get(sc.id) || []);

	async function load() {
		const list: Asset[] = await api<Asset[]>(`/assets?screen_id=${sc.id}`);
		for (const a of list) upsertAsset(a);
	}

	// Drag the whole screen in canvas (moves its x,y)
	let dragging = $state(false);
	let start = { x: 0, y: 0 };
	let orig = { x: 0, y: 0 };
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
		const newX = orig.x + dx;
		const newY = orig.y + dy;
		const updatedScreen = { ...sc, x: newX, y: newY };
		upsertScreen(updatedScreen);
	}
	function onScreenUp(_e: KonvaMouseEvent) {
		dragging = false;
		if (online.current && (sc.x !== orig.x || sc.y !== orig.y)) {
			api(`/screens/${sc.id}`, { method: 'PUT', body: JSON.stringify({ x: sc.x, y: sc.y }) });
		}
	}

	onMount(load);
</script>

<Group
	config={{ x: sc.x, y: sc.y }}
	on:mousedown={onScreenDown}
	on:mouseup={onScreenUp}
	on:mousemove={onScreenMove}
>
	<div class="glass">
		<!-- Hashed background pattern -->
		<HashedBackground
			width={sc.width}
			height={sc.height}
			fill="#22222200"
			strokeColor="oklch(70.7% .022 261.325)"
			strokeWidth={2}
			cornerRadius={8}
			lineSpacing={40}
		/>
		<KText
			config={{
				text: `${sc.name} (${sc.width}×${sc.height})`,
				fill: '#e2e8f0',
				fontSize: 14,
				fontWeight: '500',
				x: 12,
				y: 12
			}}
		/>
		{#each myAssets as a (a.id)}
			{#if a.type === 'image'}
				<ImageAsset {a} />
			{:else}
				<TextAsset {a} />
			{/if}
		{/each}
	</div>
</Group>
