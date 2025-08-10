<script lang="ts">
  import Toolbar from '../lib/components/Toolbar.svelte';
  import Canvas from '../lib/components/Canvas.svelte';
  import { api, uploadFile } from '../lib/api';
  import { online, upsertAsset, screens } from '../lib/stores';

  let hover = false;

  async function onDrop(e: DragEvent) {
    e.preventDefault(); hover = false;
    if (!$online) return; // keep local only? For now, require online to upload
    const files = e.dataTransfer?.files; if (!files) return;
    for (const file of Array.from(files)) {
      // Upload to backend to get a URL
      const { url } = await uploadFile(file);
      // Place on the first screen by default at (50,50)
      const sc = (await screens.get())[0];
      const asset = await api('/assets', { method: 'POST', body: JSON.stringify({ type: 'image', screen_id: sc.id, x: 50, y: 50, src: url })});
      upsertAsset(asset);
    }
  }
</script>

<div class="flex flex-col h-screen" on:dragover|preventDefault={() => (hover = true)} on:dragleave={() => (hover = false)} on:drop={onDrop}>
  <Toolbar />
  <div class="relative flex-1">
    {#if hover}
      <div class="absolute inset-0 border-4 border-dashed border-primary z-20 pointer-events-none"></div>
    {/if}
    <Canvas />
  </div>
</div>
