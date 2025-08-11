# Konva UX — Plug-and-Play Patterns (Svelte 5 + Konva)

Focus: panning/zooming, marquee selection, selection/transformer wiring, tooltips/hover, mini-map preview, and performance.

Conventions
- Use `bind:handle` to access Konva nodes.
- Prefer pointer events (`pointerdown/move/up/wheel`).
- Use separate layers: content, overlays (hover/guides), controls (transformer/marquees).

## 1) Wheel zoom into cursor + spacebar pan

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Stage, Layer, Rect } from 'svelte-konva';

  let stage: any;
  let isPanning = false;
  const scaleBy = 1.05; // zoom speed

  function onWheel(e: any) {
    e.evt.preventDefault();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? 1 : -1;
    const newScale = direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space' && !isPanning) {
      isPanning = true;
      stage.draggable(true);
      document.body.style.cursor = 'grab';
    }
  }
  function onKeyUp(e: KeyboardEvent) {
    if (e.code === 'Space' && isPanning) {
      isPanning = false;
      stage.draggable(false);
      document.body.style.cursor = 'default';
    }
  }

  onMount(async () => {
    await tick();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  });
</script>

<Stage bind:handle={stage} on:wheel={onWheel} config={{ width: 1000, height: 700 }}>
  <Layer>
    <Rect config={{ x: 100, y: 100, width: 200, height: 140, fill: '#60a5fa' }} />
  </Layer>
</Stage>
```

## 2) Marquee selection (rubber-band) + attach Transformer

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Stage, Layer, Rect, Transformer } from 'svelte-konva';

  let stage: any; let content: any; let overlay: any; let tr: any;
  let selectionRect: any; let selection = new Set<any>();
  let startPos = { x: 0, y: 0 };
  let selecting = false;

  function beginSelection(pos: {x:number;y:number}) {
    selecting = true; startPos = pos;
    selectionRect.visible(true);
    selectionRect.width(0); selectionRect.height(0);
  }
  function updateSelection(pos: {x:number;y:number}) {
    if (!selecting) return;
    const x = Math.min(pos.x, startPos.x);
    const y = Math.min(pos.y, startPos.y);
    const w = Math.abs(pos.x - startPos.x);
    const h = Math.abs(pos.y - startPos.y);
    selectionRect.setAttrs({ x, y, width: w, height: h });
    overlay.batchDraw();
  }
  function endSelection() {
    if (!selecting) return; selecting = false;
    const box = selectionRect.getClientRect({ skipStroke: false });
    selectionRect.visible(false); overlay.draw();
    selection.clear();
    content.find('.selectable').each((node: any) => {
      if (haveIntersection(box, node.getClientRect())) selection.add(node);
    });
    tr.nodes(Array.from(selection));
  }
  function haveIntersection(r1: any, r2: any) {
    return !(r2.x > r1.x + r1.width || r2.x + r2.width < r1.x || r2.y > r1.y + r1.height || r2.y + r2.height < r1.y);
  }

  onMount(async () => {
    await tick();
    selectionRect = new (await import('konva')).default.Rect({
      fill: 'rgba(14, 165, 233, 0.15)',
      stroke: '#0ea5e9',
      dash: [4, 4],
      visible: false,
      listening: false,
    });
    overlay.add(selectionRect);

    stage.on('mousedown touchstart', (e: any) => {
      if (e.target === stage) beginSelection(stage.getPointerPosition());
    });
    stage.on('mousemove touchmove', () => updateSelection(stage.getPointerPosition()));
    stage.on('mouseup touchend', endSelection);
  });
</script>

<Stage bind:handle={stage} config={{ width: 1000, height: 700 }}>
  <Layer bind:handle={content}>
    <Rect name="selectable" config={{ x: 120, y: 100, width: 140, height: 120, fill: '#f59e0b', draggable: true }} />
    <Rect name="selectable" config={{ x: 360, y: 240, width: 180, height: 100, fill: '#a78bfa', draggable: true }} />
  </Layer>
  <Layer bind:handle={overlay}>
    <Transformer bind:handle={tr} />
  </Layer>
</Stage>
```

## 3) Hover highlights + DOM tooltip

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Stage, Layer, Rect } from 'svelte-konva';

  let stage: any; let layer: any; let hover: any; let tooltip: HTMLDivElement;

  onMount(async () => {
    await tick();
    hover = new (await import('konva')).default.Rect({ listening: false, stroke: '#0ea5e9', strokeWidth: 1, dash: [4, 4], visible: false });
    layer.add(hover); layer.draw();

    stage.on('pointermove', (e: any) => {
      const t = e.target;
      if (t && t !== stage && t.hasName?.('selectable')) {
        const box = t.getClientRect();
        hover.setAttrs({ x: box.x, y: box.y, width: box.width, height: box.height, visible: true });
        tooltip.style.transform = `translate(${e.evt.clientX + 8}px, ${e.evt.clientY + 8}px)`;
        tooltip.textContent = `w:${Math.round(box.width)} h:${Math.round(box.height)}`;
      } else {
        hover.visible(false);
      }
      layer.batchDraw();
    });
  });
</script>

<div bind:this={tooltip} style="position:fixed; pointer-events:none; background:#111827; color:#fff; padding:2px 6px; border-radius:4px; font:12px/1.4 system-ui;" />

<Stage bind:handle={stage} config={{ width: 800, height: 600 }}>
  <Layer bind:handle={layer}>
    <Rect name="selectable" config={{ x: 100, y: 120, width: 160, height: 120, fill: '#22c55e' }} />
  </Layer>
</Stage>
```

## 4) Mini-map preview (snapshot)

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Stage, Layer, Rect } from 'svelte-konva';

  let main: any; let previewUrl = '';
  const scale = 0.25; // preview scale factor

  async function updatePreview() {
    const url = main.toDataURL({ pixelRatio: scale });
    previewUrl = url;
  }
  onMount(() => {
    // call updatePreview() on debounced edits, dragend, transformend, etc.
  });
</script>

<div style="display:flex; gap:12px;">
  <Stage bind:handle={main} config={{ width: 1000, height: 700 }}>
    <Layer>
      <Rect config={{ x: 200, y: 200, width: 240, height: 180, fill: '#ef4444', draggable: true }} on:dragend={updatePreview} />
    </Layer>
  </Stage>
  <div>
    <img alt="preview" src={previewUrl} style="width:250px; height:auto; border:1px solid #e5e7eb; background:#fff;" />
  </div>
</div>
```

## 5) Performance checklist
- Use `layer.batchDraw()` for frequent updates.
- Disable hit graph where possible: `node.listening(false)` / `layer.listening(false)`.
- Cache complex shapes: `node.cache()`; invalidate on attribute changes.
- Keep guides/hover on a thin overlay layer; clear its children instead of redrawing everything.
- For massive scenes, set `perfectDrawEnabled: false` on shapes where AA quality isn’t critical.
