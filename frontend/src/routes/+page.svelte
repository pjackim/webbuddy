<script lang="ts">
	import Toolbar from '../lib/components/Toolbar.svelte';
	import Canvas from '../lib/components/Canvas.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { api, uploadFile } from '../lib/api';
	import { online, upsertAsset, screens, type Asset } from '$lib/stores.svelte';
	import { toast } from 'svelte-sonner';

	let hover = $state(false);

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		hover = true;
	}

	async function onDrop(e: DragEvent) {
		e.preventDefault();
		hover = false;
		if (!online.current) {
			toast.error('You must be online to upload files.');
			return;
		}
		const files = e.dataTransfer?.files;
		if (!files) return;

		for (const file of Array.from(files)) {
			const toastId = toast.loading(`Uploading ${file.name}...`);
			try {
				// Upload to backend to get a URL
				const { url } = await uploadFile(file);
				// Place on the first screen by default at (50,50)
				const sc = screens()[0];
				if (!sc) {
					toast.error('No screen available to place the asset.', { id: toastId });
					continue;
				}
				const asset = await api<Asset>('/assets', {
					method: 'POST',
					body: JSON.stringify({ type: 'image', screen_id: sc.id, x: 50, y: 50, src: url })
				});
				upsertAsset(asset);
				toast.success(`Successfully uploaded ${file.name}!`, { id: toastId });
			} catch (error) {
				toast.error(`Failed to upload ${file.name}.`, { id: toastId });
			}
		}
	}
</script>

<div
	class="flex flex-col h-screen"
	role="group"
	ondragover={onDragOver}
	ondragleave={() => (hover = false)}
	ondrop={onDrop}
>
	<Toolbar />
	<div class="relative flex-1">
		{#if hover}
			<div class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
				<Card.Root class="w-1/2 h-1/2 border-4 border-dashed border-primary flex items-center justify-center">
					<Card.Content class="text-center">
						<h2 class="text-2xl font-bold">Drop files to upload</h2>
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
		<Canvas />
	</div>
</div>
