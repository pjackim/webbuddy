# Konva Transformations — Plug-and-Play (Svelte 5 + TS)

Goal: drop-in Transformer + bbox utilities for centered scaling, aspect ratio, min/max limits, grid/object snapping, rotation snaps, and baking scale.

Key notes
- Attach Transformer via `tr.nodes([node])`. Use `bind:handle`.
- `boundBoxFunc(oldBox, newBox)` lets you clamp/snap size/position live.
- Use `transformstart/transform/transformend` events for UX (guides/HUD/state).

## 0) BBox utilities (copy as `bbox-utils.ts`)

```ts
export function makeKeepRatioBBoxFunc(
  ratio: number,
  { minW = 16, minH = 16, maxW = Infinity, maxH = Infinity, centered = false } = {}
) {
  return (oldBox: any, newBox: any) => {
    let w = Math.max(minW, Math.min(newBox.width, maxW));
    let h = Math.max(minH, Math.min(newBox.height, maxH));

    const fitH = Math.round(w / ratio);
    const fitW = Math.round(h * ratio);
    const useW = Math.abs(fitH - h) <= Math.abs(fitW - w);
    if (useW) h = fitH; else w = fitW;

    let x = newBox.x, y = newBox.y;
    if (centered) {
      const cxOld = oldBox.x + oldBox.width / 2;
      const cyOld = oldBox.y + oldBox.height / 2;
      x = cxOld - w / 2; y = cyOld - h / 2;
    }
    return { x, y, width: w, height: h };
  };
}

export function clampSizeBBox(minW = 20, minH = 20, maxW = 4000, maxH = 4000) {
  return (_old: any, box: any) => ({
    x: box.x,
    y: box.y,
    width: Math.min(Math.max(box.width, minW), maxW),
    height: Math.min(Math.max(box.height, minH), maxH),
  });
}

export function gridSnapBBox(grid = 8) {
  return (_old: any, box: any) => ({
    x: Math.round(box.x / grid) * grid,
    y: Math.round(box.y / grid) * grid,
    width: Math.round(box.width / grid) * grid,
    height: Math.round(box.height / grid) * grid,
  });
}

export function composeBBox(...funcs: Array<(o: any, n: any) => any>) {
  return (oldBox: any, newBox: any) => funcs.reduce((acc, fn) => fn(oldBox, acc), newBox);
}

// Optional: object-guide snapping in bbox (sketch)
export type Guides = { vertical: number[]; horizontal: number[] };
export function makeGuidedBBoxFunc(getGuides: () => Guides, tol = 5) {
  return (_old: any, box: any) => {
    const guides = getGuides();
    const edgesV = [box.x, box.x + box.width, box.x + box.width / 2];
    const edgesH = [box.y, box.y + box.height, box.y + box.height / 2];

    const snap = (val: number, arr: number[]) => {
      let best = val, bestDiff = tol + 1;
      for (const g of arr) {
        const d = Math.abs(g - val);
        if (d < bestDiff && d <= tol) { best = g; bestDiff = d; }
      }
      return best;
    };

    const x = snap(box.x, guides.vertical);
    const y = snap(box.y, guides.horizontal);
    return { ...box, x, y };
  };
}
```

## 1) RobustTransformer.svelte — one component, many knobs

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Transformer } from 'svelte-konva';
  import { composeBBox, gridSnapBBox, clampSizeBBox, makeKeepRatioBBoxFunc } from './bbox-utils';

  export let target: any;              // Konva node to attach
  export let keepRatio = true;
  export let centeredScaling = true;
  export let grid = 0;                 // e.g., 10 to enable grid snapping
  export let minW = 16, minH = 16, maxW = Infinity, maxH = Infinity;
  export let rotationSnaps: number[] = [0, 45, 90, 135, 180, 225, 270, 315];
  export let enabledAnchors: string[] = [
    'top-left','top-right','bottom-left','bottom-right',
    'middle-left','middle-right','middle-top','middle-bottom'
  ];
  export let showRotate = true;        // keep rotate handle
  export let bakeScaleOnEnd = false;   // bake scale into size to keep stroke widths constant

  let tr: any;
  let ratio = 1;

  function calcRatio(node: any) {
    try {
      const w = node.width?.() ?? 1;
      const h = node.height?.() ?? 1;
      return Math.max(0.0001, w / h);
    } catch { return 1; }
  }

  onMount(async () => {
    await tick();
    if (!target) return;

    tr.nodes([target]);
    tr.setAttrs({
      enabledAnchors,
      rotateEnabled: showRotate,
      rotationSnaps,
      centeredScaling,
      padding: 5,
      ignoreStroke: true,
      anchorSize: 9,
    });

    if (keepRatio) ratio = calcRatio(target);

    const funcs = [] as Array<(o:any,n:any)=>any>;
    if (keepRatio) funcs.push(makeKeepRatioBBoxFunc(ratio, { minW, minH, maxW, maxH, centered: centeredScaling }));
    else funcs.push(clampSizeBBox(minW, minH, maxW, maxH));
    if (grid > 0) funcs.push(gridSnapBBox(grid));

    tr.boundBoxFunc(composeBBox(...funcs));

    const onEnd = () => {
      if (!bakeScaleOnEnd) return;
      const sX = target.scaleX?.() ?? 1;
      const sY = target.scaleY?.() ?? 1;
      if ((sX !== 1 || sY !== 1) && target.width && target.height) {
        target.width(target.width() * sX);
        target.height(target.height() * sY);
        target.scale({ x: 1, y: 1 });
      }
    };
    tr.on('transformend', onEnd);
    target.on?.('transformend', onEnd);
  });
</script>

<Transformer bind:handle={tr} />
```

Usage
- Create your shape, bind `handle` as `target`, render `RobustTransformer` above it.
- Switch `target` to reattach to different nodes; persist your app state on `transformend`.

## 2) Centered scaling / aspect ratio (one-liners)

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Transformer } from 'svelte-konva';
  let tr: any;
  onMount(async () => { await tick(); tr.centeredScaling(true); tr.keepRatio(true); });
</script>
<Transformer bind:handle={tr} />
```

## 3) Rotation snapping angles

```ts
tr.rotationSnaps([0, 15, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]);
```

## 4) Bake scale into width/height on end

```ts
function bakeScale(node: any) {
  const sX = node.scaleX();
  const sY = node.scaleY();
  if (sX !== 1 || sY !== 1) {
    if (typeof node.width === 'function' && typeof node.height === 'function') {
      node.width(node.width() * sX);
      node.height(node.height() * sY);
    }
    node.scale({ x: 1, y: 1 });
  }
}
```

Hook: call in `transformend` for crisp, constant stroke widths.
