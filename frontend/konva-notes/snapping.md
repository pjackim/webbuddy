# Konva Snapping — Plug-and-Play Snippets (Svelte + Konva)

Focus: grid snapping, snap-on-end, object-to-object snapping with visual guides, and transformer-era snapping. Each snippet is self-contained.

Core APIs
- `draggable: true` enables dragging
- `dragBoundFunc(pos)` constrains/adjusts drag position live
- Events: `dragstart`, `dragmove`, `dragend`
- Geometry: `absolutePosition()`, `getClientRect()`

## 1) Grid snapping during drag (dragBoundFunc)

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Stage, Layer, Rect } from 'svelte-konva';

  const grid = 20;
  let rect: any;

  onMount(async () => {
    await tick();
    rect.draggable(true);
    rect.dragBoundFunc((pos) => ({
      x: Math.round(pos.x / grid) * grid,
      y: Math.round(pos.y / grid) * grid,
    }));
  });
</script>

<Stage config={{ width: 800, height: 600 }}>
  <Layer>
    <Rect bind:handle={rect} config={{ x: 50, y: 50, width: 100, height: 80, fill: '#3b82f6' }} />
  </Layer>
</Stage>
```

## 2) Snap only on dragend (unconstrained feel)

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Stage, Layer, Rect } from 'svelte-konva';

  const grid = 20;
  let rect: any;

  onMount(async () => {
    await tick();
    rect.draggable(true);
    rect.on('dragend', () => {
      const p = rect.position();
      rect.position({
        x: Math.round(p.x / grid) * grid,
        y: Math.round(p.y / grid) * grid,
      });
      rect.getLayer()?.batchDraw();
    });
  });
</script>

<Stage config={{ width: 800, height: 600 }}>
  <Layer>
    <Rect bind:handle={rect} config={{ x: 50, y: 50, width: 120, height: 90, fill: '#22c55e' }} />
  </Layer>
</Stage>
```

## 3) Snap to other objects with visual guides

Drop-in helpers that reproduce the core of Konva’s Objects_Snapping demo.

```ts
// guides.ts
export type Guides = { vertical: number[]; horizontal: number[] };
export const GUIDELINE_OFFSET = 5;

export function getLineGuideStops(stage: any, skipShape?: any): Guides {
  const vertical = [0, stage.width() / 2, stage.width()];
  const horizontal = [0, stage.height() / 2, stage.height()];
  stage.find('.snap-target').forEach((node: any) => {
    if (node === skipShape) return;
    const box = node.getClientRect();
    vertical.push(box.x, box.x + box.width, box.x + box.width / 2);
    horizontal.push(box.y, box.y + box.height, box.y + box.height / 2);
  });
  return { vertical, horizontal };
}

export function getObjectSnappingEdges(node: any) {
  const box = node.getClientRect();
  const abs = node.absolutePosition();
  return {
    vertical: [
      { guide: Math.round(box.x), offset: Math.round(abs.x - box.x) },
      { guide: Math.round(box.x + box.width / 2), offset: Math.round(abs.x - box.x - box.width / 2) },
      { guide: Math.round(box.x + box.width), offset: Math.round(abs.x - box.x - box.width) },
    ],
    horizontal: [
      { guide: Math.round(box.y), offset: Math.round(abs.y - box.y) },
      { guide: Math.round(box.y + box.height / 2), offset: Math.round(abs.y - box.y - box.height / 2) },
      { guide: Math.round(box.y + box.height), offset: Math.round(abs.y - box.y - box.height) },
    ],
  };
}

export function getGuides(stops: Guides, edges: any) {
  const resultV: any[] = [];
  const resultH: any[] = [];
  stops.vertical.forEach((lineGuide) => {
    edges.vertical.forEach((b: any) => {
      const diff = Math.abs(lineGuide - b.guide);
      if (diff < GUIDELINE_OFFSET) resultV.push({ lineGuide, diff, offset: b.offset });
    });
  });
  stops.horizontal.forEach((lineGuide) => {
    edges.horizontal.forEach((b: any) => {
      const diff = Math.abs(lineGuide - b.guide);
      if (diff < GUIDELINE_OFFSET) resultH.push({ lineGuide, diff, offset: b.offset });
    });
  });

  const guides: any[] = [];
  const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
  const minH = resultH.sort((a, b) => a.diff - b.diff)[0];
  if (minV) guides.push({ lineGuide: minV.lineGuide, orientation: 'V', offset: minV.offset });
  if (minH) guides.push({ lineGuide: minH.lineGuide, orientation: 'H', offset: minH.offset });
  return guides;
}
```

Svelte wiring with a dedicated guides layer:

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Stage, Layer, Rect } from 'svelte-konva';
  import Konva from 'konva';
  import { GUIDELINE_OFFSET, getLineGuideStops, getObjectSnappingEdges, getGuides } from './guides';

  let stageW = 1000, stageH = 700;
  let a: any, b: any; // two snap targets
  let guidesLayer: any;
  let stageHandle: any;

  function drawGuides(guides: any[]) {
    guidesLayer.destroyChildren();
    for (const g of guides) {
      const isV = g.orientation === 'V';
      const points = isV ? [g.lineGuide, -10000, g.lineGuide, 10000] : [-10000, g.lineGuide, 10000, g.lineGuide];
      const line = new Konva.Line({
        points,
        stroke: '#0ea5e9',
        strokeWidth: 1,
        dash: [4, 4],
        listening: false,
        name: 'guid-line'
      });
      guidesLayer.add(line);
    }
    guidesLayer.batchDraw();
  }

  onMount(async () => {
    await tick();
    [a, b].forEach((n) => n.name('snap-target'));

    [a, b].forEach((node) => {
      node.draggable(true);
      node.on('dragmove', (e: any) => {
        const stops = getLineGuideStops(stageHandle, node);
        const edges = getObjectSnappingEdges(node);
        const guides = getGuides(stops, edges);

        // Apply snapping
        const abs = node.absolutePosition();
        guides.forEach((lg: any) => {
          if (lg.orientation === 'V') abs.x = lg.lineGuide + lg.offset;
          if (lg.orientation === 'H') abs.y = lg.lineGuide + lg.offset;
        });
        node.absolutePosition(abs);

        drawGuides(guides);
      });
      node.on('dragend', () => {
        guidesLayer.destroyChildren();
        guidesLayer.draw();
      });
    });
  });
</script>

<Stage bind:handle={stageHandle} config={{ width: stageW, height: stageH }}>
  <Layer>
    <Rect bind:handle={a} config={{ x: 120, y: 90, width: 140, height: 120, fill: '#f97316' }} />
    <Rect bind:handle={b} config={{ x: 420, y: 240, width: 180, height: 100, fill: '#a78bfa' }} />
  </Layer>
  <Layer bind:handle={guidesLayer} />
</Stage>
```

## 4) Snapping during transform (Transformer + boundBoxFunc)

Grid snap via `boundBoxFunc`:

```ts
export function gridSnapBBox(grid = 10) {
  return (_old: any, box: any) => ({
    x: Math.round(box.x / grid) * grid,
    y: Math.round(box.y / grid) * grid,
    width: Math.round(box.width / grid) * grid,
    height: Math.round(box.height / grid) * grid,
  });
}
```

Use with Transformer: `transformer.boundBoxFunc(gridSnapBBox(10))`. For object-to-object snapping, port the guide computation into `boundBoxFunc` (see transforms.md for a composed example).

UX tips
- Keep guides in a separate, non-listening layer.
- Allow a modifier (e.g., hold Alt) to temporarily disable snapping.
- Debounce heavy computations if many nodes are candidates.
