<script lang="ts">
  import { onMount } from 'svelte';
  import { Stage, Layer } from 'svelte-konva';
  import ScreenFrame from './ScreenFrame.svelte';
  import { screens, assetsByScreen, online } from '$lib/stores';
  import { api } from '$lib/api';
  import { connectWS } from '$lib/ws';

  let scale = 0.25; // stage zoom
  let offset = { x: 0, y: 0 };

  async function load() {
    const sc = await api('/screens');
    screens.set(sc);
    const all = await api('/assets');
    // assets store filled indirectly in ScreenFrame via events or do it here if preferred
    // We'll broadcast on initial GET too for simplicity: update locally
    // but to keep simple, ScreenFrame will fetch per screen.
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const factor = 1.05;
    const direction = e.deltaY > 0 ? -1 : 1;
    scale = Math.max(0.05, Math.min(5, scale * (direction > 0 ? factor : 1/factor)));
  }

  let panning = false; let last = { x: 0, y: 0 };
  function onMouseDown(e: MouseEvent) { panning = true; last = { x: e.clientX, y: e.clientY }; }
  function onMouseMove(e: MouseEvent) {
    if (!panning) return;
    const dx = e.clientX - last.x; const dy = e.clientY - last.y;
    offset.x += dx; offset.y += dy; last = { x: e.clientX, y: e.clientY };
  }
  function onMouseUp() { panning = false; }

  onMount(() => {
    connectWS();
    load();
  });
</script>

<div class="w-full h-[calc(100vh-64px)]" on:wheel={onWheel} on:mousedown={onMouseDown} on:mousemove={onMouseMove} on:mouseup={onMouseUp}>
  <Stage config={{ width: innerWidth, height: innerHeight-64, scaleX: scale, scaleY: scale, x: offset.x, y: offset.y }}>
    <Layer>
      {#each $screens as sc}
        <ScreenFrame {sc} />
      {/each}
    </Layer>
  </Stage>
</div>
