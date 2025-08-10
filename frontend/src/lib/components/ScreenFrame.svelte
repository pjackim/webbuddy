<script lang="ts">
	import type { Screen, Asset } from '../stores';
	import { Group, Rect, Text as KText, Transformer } from 'svelte-konva';
	import ImageAsset from './assets/ImageAsset.svelte';
	import TextAsset from './assets/TextAsset.svelte';
	import { assetsByScreen, online, upsertAsset, selected, upsertScreen } from '../stores';
	import { api } from '../api';
	import { onMount } from 'svelte';
	import type Konva from 'konva';
	import type { KonvaEventObject } from 'konva/lib/Node';

	// reference to the Konva group for this screen
	let group: Konva.Group;

	export let sc: Screen;
	let myAssets: Asset[] = [];

	async function load() {
		const list: Asset[] = await api<Asset[]>(`/assets?screen_id=${sc.id}`);
		for (const a of list) upsertAsset(a);
	}

	$: myAssets = $assetsByScreen.get(sc.id) || [];

	function selectThis(e: KonvaEventObject<MouseEvent>) {
		selected.set(sc.id);
		// prevent stage-level handlers from firing
		if (e && e.cancelBubble !== undefined) e.cancelBubble = true;
	}

	function dragEnd(e: KonvaEventObject<DragEvent>) {
		const node = e.target as Konva.Group;
		sc = { ...sc, x: node.x(), y: node.y() };
		upsertScreen(sc);
		if ($online)
			api(`/screens/${sc.id}`, { method: 'PUT', body: JSON.stringify({ x: sc.x, y: sc.y }) });
	}

	function transformEnd() {
		const node = group;
		const scaleX = node.scaleX();
		const scaleY = node.scaleY();
		const newWidth = sc.width * scaleX;
		const newHeight = sc.height * scaleY;
		const newX = node.x();
		const newY = node.y();
		// reset scale to avoid accumulating
		node.scale({ x: 1, y: 1 });
		sc = { ...sc, x: newX, y: newY, width: newWidth, height: newHeight };
		upsertScreen(sc);
		if ($online)
			api(`/screens/${sc.id}`, {
				method: 'PUT',
				body: JSON.stringify({ x: sc.x, y: sc.y, width: sc.width, height: sc.height })
			});
	}

	onMount(load);
</script>

<Group
	config={{ x: sc.x, y: sc.y, draggable: $selected === sc.id }}
	bind:this={group}
	on:click={selectThis}
	on:dragend={dragEnd}
	on:transformend={transformEnd}
>
	<Rect
		config={{
			width: sc.width,
			height: sc.height,
			fill: '#222',
			stroke: $selected === sc.id ? '#0bf' : '#555',
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
	{#if $selected === sc.id}
		<Transformer config={{ nodes: [group], rotateEnabled: false, ignoreStroke: true }} />
	{/if}
</Group>
