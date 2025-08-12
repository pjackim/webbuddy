<script lang="ts">
	import { Toolbar } from '$lib/features/toolbar';
	import { Canvas } from '$lib/features/canvas';
	import * as Card from '$lib/ui/card';
	import { api, uploadFile } from '$lib/api';
	import { online, upsertAsset, screens, type Asset } from '$lib/stores';
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
	class="layout-container"
	role="group"
	ondragover={onDragOver}
	ondragleave={() => (hover = false)}
	ondrop={onDrop}
>
	<div class="layout-header">
		<Toolbar />
	</div>
	<div class="layout-main">
		{#if hover}
			<div class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
				<Card.Root
					class="w-1/2 h-1/2 border-4 border-dashed border-primary flex items-center justify-center glassmorphism glow-cyan animate-pulse"
				>
					<Card.Content class="text-center">
						<h2 class="text-2xl font-bold text-glow">Drop files to upload</h2>
						<p class="text-muted-foreground mt-2">Drag and drop your images here</p>
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
		<Canvas />
	</div>
</div>