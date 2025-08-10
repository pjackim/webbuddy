<script lang="ts">
  import { Image } from 'svelte-konva';
  import { onMount } from 'svelte';
  import { online, upsertAsset } from '../../stores';
  import { api } from '../../api';

  export let a: any; // ImageAsset
  let htmlImage: HTMLImageElement;
  let isDragging = false; let start = { x: 0, y: 0 }; let orig = { x: 0, y: 0 };

  onMount(() => {
    htmlImage = new window.Image();
    htmlImage.crossOrigin = 'anonymous';
    htmlImage.src = a.src;
  });

  function onDown(e) { isDragging = true; start = { x: e.evt.clientX, y: e.evt.clientY }; orig = { x: a.x, y: a.y }; }
  function onMove(e) {
    if (!isDragging) return;
    const dx = e.evt.clientX - start.x; const dy = e.evt.clientY - start.y;
    a = { ...a, x: orig.x + dx, y: orig.y + dy };
  }
  async function onUp() {
    isDragging = false;
    upsertAsset(a);
    if ($online) await api(`/assets/${a.id}`, { method: 'PUT', body: JSON.stringify({ x: a.x, y: a.y }) });
  }
</script>

<Image image={htmlImage} x={a.x} y={a.y} draggable={false} on:mousedown={onDown} on:mousemove={onMove} on:mouseup={onUp} />
