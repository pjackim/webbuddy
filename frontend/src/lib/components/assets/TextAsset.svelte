<script lang="ts">
  import { Text as KText } from 'svelte-konva';
  import { online, upsertAsset } from '$lib/stores';
  import { api } from '$lib/api';

  export let a: any; // TextAsset
  let isDragging = false; let start = { x: 0, y: 0 }; let orig = { x: 0, y: 0 };

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

<KText text={a.text} x={a.x} y={a.y} fontSize={a.font_size} fill={a.color} on:mousedown={onDown} on:mousemove={onMove} on:mouseup={onUp} />
