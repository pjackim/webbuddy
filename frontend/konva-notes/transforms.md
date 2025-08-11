# Konva Transformations — Advanced Notes (Svelte + TypeScript)

Goal: Build robust, extensible, Illustrator-grade transformation UX on top of Konva and svelte-konva: centered scaling, aspect-ratio constraints, transform events, snapping (grid/objects/rotation), styling, limits, and custom logic.

Sources reviewed:
- svelte-konva wrapper overview: [`docs/svelte-konva-docs.md`](docs/svelte-konva-docs.md:1)
- Konva docs:
  - Transform events (Transformer + node): Transform_Events
  - Centered scaling: Centered_Scaling
  - Complex styling: Transformer_Complex_Styling
  - General Transformer API (nodes, anchors, rotationSnaps, boundBoxFunc, etc.)

Notes:
- svelte-konva is a thin wrapper. You use Konva’s Transformer directly via bind:handle.
- svelte-konva auto-syncs bound config after transformend; use staticConfig if you want to fully control persistence.

--------------------------------------------------------------------------------

Svelte boilerplate (bind both node and transformer handles)

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Stage, Layer, Rect, Transformer } from 'svelte-konva';

  let stageW = 1000, stageH = 700;

  // Target node + transformer handles
  let rectHandle: any;
  let trHandle: any;

  // Optional: keep app state if you bind config
  let rectConfig = {
    x: 120, y: 100, width: 260, height: 160,
    fill: '#4f46e5', stroke: '#0f172a', strokeWidth: 2,
    draggable: true
  };

  onMount(async () => {
    await tick();
    trHandle.nodes([rectHandle]); // attach transformer to the rectangle
    // Configure common options
    trHandle.setAttrs({
      enabledAnchors: [
        'top-left','top-right','bottom-left','bottom-right',
        'middle-left','middle-right','middle-top','middle-bottom'
      ],
      rotateEnabled: true,
      rotateAnchorOffset: 24,
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
      anchorSize: 9,
      padding: 5,
      ignoreStroke: true
    });

    // Events — these fire on both transformer AND attached node
    trHandle.on('transformstart', () => {/* prep guides / save state */});
    trHandle.on('transform', () => {/* update guides / live HUD */});
    trHandle.on('transformend', () => {/* commit state / cleanup */});
  });
</script>

<Stage config={{ width: stageW, height: stageH }}>
  <Layer>
    <Rect bind:handle={rectHandle} bind:config={rectConfig} />
    <Transformer bind:handle={trHandle} />
  </Layer>
</Stage>
```

--------------------------------------------------------------------------------

Centered scaling

- Option: centeredScaling: true
- Alt key can trigger centered scaling even when option is false (Konva default behavior)

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Transformer } from 'svelte-konva';
  let tr: any;
  onMount(async () => {
    await tick();
    tr.centeredScaling(true);
  });
</script>

<Transformer bind:handle={tr} />
```

--------------------------------------------------------------------------------

Keep aspect ratio

Two approaches:
1) Built-in: keepRatio: true (useful for most shapes)
2) Custom: boundBoxFunc (for absolute control)

Built-in keepRatio:

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Transformer } from 'svelte-konva';
  let tr: any;
  onMount(async () => {
    await tick();
    tr.keepRatio(true);
  });
</script>

<Transformer bind:handle={tr} />
```

Maintain ratio with boundBoxFunc (works even with rotations and complex constraints):

```ts
// Use this factory to preserve a specific ratio and size limits
export function makeKeepRatioBBoxFunc(
  ratio: number,
  {
    minW = 16, minH = 16,
    maxW = Infinity, maxH = Infinity,
    centered = false
  }: { minW?: number; minH?: number; maxW?: number; maxH?: number; centered?: boolean } = {}
) {
  return (oldBox: any, newBox: any) => {
    // Adjust width/height to maintain ratio
    let w = Math.max(minW, Math.min(newBox.width, maxW));
    let h = Math.max(minH, Math.min(newBox.height, maxH));

    // Snap either width or height to maintain ratio — choose the dimension that changed most
    const fitH = Math.round(w / ratio);
    const fitW = Math.round(h * ratio);
    const useW = Math.abs(fitH - h) <= Math.abs(fitW - w);
    if (useW) h = fitH; else w = fitW;

    let x = newBox.x;
    let y = newBox.y;

    // If centered scaling, keep center fixed
    if (centered) {
      const cxOld = oldBox.x + oldBox.width / 2;
      const cyOld = oldBox.y + oldBox.height / 2;
      x = cxOld - w / 2;
      y = cyOld - h / 2;
    }

    return { x, y, width: w, height: h };
  };
}
```

Usage:

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Transformer } from 'svelte-konva';
  import { makeKeepRatioBBoxFunc } from './bbox-utils';

  let tr: any, node: any;
  let ratio = 260 / 160;
  onMount(async () => {
    await tick();
    tr.nodes([node]);
    tr.boundBoxFunc(makeKeepRatioBBoxFunc(ratio, { minW: 40, minH: 40, centered: true }));
  });
</script>

<Transformer bind:handle={tr} />
```

--------------------------------------------------------------------------------

Min/Max size limits (Resize Limits)

Use boundBoxFunc to clamp size:

```ts
export function clampSizeBBox(minW=20, minH=20, maxW=4000, maxH=4000) {
  return (oldBox: any, newBox: any) => ({
    x: newBox.x,
    y: newBox.y,
    width: Math.min(Math.max(newBox.width, minW), maxW),
    height: Math.min(Math.max(newBox.height, minH), maxH)
  });
}
```

--------------------------------------------------------------------------------

Snapping during transform

Grid snapping inside boundBoxFunc:

```ts
export function gridSnapBBox(grid=8) {
  return (_old: any, box: any) => ({
    x: Math.round(box.x / grid) * grid,
    y: Math.round(box.y / grid) * grid,
    width: Math.round(box.width / grid) * grid,
    height: Math.round(box.height / grid) * grid
  });
}
```

Composite constraints (keepRatio + grid + min/max):

```ts
export function composeBBox(...funcs: Array<(o:any,n:any)=>any>) {
  return (oldBox: any, newBox: any) => funcs.reduce((acc, fn) => fn(oldBox, acc), newBox);
}

// Example:
const bbox = composeBBox(
  makeKeepRatioBBoxFunc(ratio, { minW: 40, minH: 40, centered: true }),
  gridSnapBBox(10),
  clampSizeBBox(40, 40, 2000, 2000)
);
tr.boundBoxFunc(bbox);
```

Snapping to other objects (Illustrator-style align-to edges/centers):
- At transformstart: compute guide stops (stage edges/centers, other nodes’ edges/centers)
- In boundBoxFunc: if new box edges/centers are within tolerance of any guide, align x/y/width/height accordingly
- Show dashed guide lines during transform; remove on transformend

Sketch:

```ts
type Guides = { vertical: number[]; horizontal: number[] };

export function makeGuidedBBoxFunc(getGuides: () => Guides, tol=5) {
  return (_old: any, box: any) => {
    const guides = getGuides();
    const edgesV = [box.x, box.x + box.width, box.x + box.width/2];
    const edgesH = [box.y, box.y + box.height, box.y + box.height/2];

    const snap = (val: number, arr: number[]) => {
      let best = val, bestDiff = tol + 1;
      for (const g of arr) {
        const d = Math.abs(g - val);
        if (d < bestDiff && d <= tol) { best = g; bestDiff = d; }
      }
      return best;
    };

    // Snap x-related edges by adjusting x/width; simplest: snap left and top (extend as needed)
    const snappedX = snap(box.x, guides.vertical);
    const snappedY = snap(box.y, guides.horizontal);

    return { ...box, x: snappedX, y: snappedY };
  };
}
```

Combine with grid and keep-ratio using composeBBox.

--------------------------------------------------------------------------------

Rotation snapping

Use rotationSnaps on Transformer:

```ts
tr.rotationSnaps([0, 15, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]);
```

--------------------------------------------------------------------------------

Styling transformer + anchors

Attributes:
- enabledAnchors: [
  'top-left','top-right','bottom-left','bottom-right',
  'middle-left','middle-right','middle-top','middle-bottom', // optional
  'rotater' // implicit rotation handle
]
- rotateLineVisible, rotateAnchorOffset, anchorSize
- borderEnabled, borderStroke, borderStrokeWidth, borderDash
- flipEnabled (allow flipping via anchors)
- ignoreStroke (exclude stroke from bbox computations)
- padding

Deep per-anchor styling via anchorStyleFunc:

```ts
tr.setAttrs({
  anchorStyleFunc: (anchor: any) => {
    // make rounded, colored anchors
    anchor.cornerRadius(50);
    anchor.fill('#ef4444');
    anchor.stroke('#111827').strokeWidth(1);

    if (anchor.hasName('middle-right')) anchor.scale({ x: 1.4, y: 1.4 });
    if (anchor.hasName('top-left')) anchor.scale({ x: 0, y: 0 }); // hide one anchor
  },
  borderEnabled: true,
  borderStroke: '#0ea5e9',
  borderStrokeWidth: 1,
  borderDash: [4, 4]
});
```

Note: Replacing anchor with an image icon is limited; for full custom UI (icons, hover tooltips) overlay your own shapes/buttons and implement their logic manually.

--------------------------------------------------------------------------------

Illustrator-like behaviors and how to replicate them

- Centered scaling (Alt): use centeredScaling: true, and Konva allows Alt behavior toggling center even if disabled.
- Maintain aspect ratio: keepRatio: true (or enforce with boundBoxFunc).
- Numeric precision scaling vs. stroke scaling:
  - If you want to keep stroke width constant, do NOT leave non-1 scale; instead, on transformend, bake scale into width/height and reset node.scale({x:1,y:1}).
  - If you want stroke to scale, leave scale values as-is (default).
- Constrain to axis:
  - Provide middle anchors only (middle-left/right or middle-top/bottom), or clamp in boundBoxFunc so only width or height changes.
- Rotation snapping (Shift-like): set rotationSnaps to common angles.
- Pivot/anchor point manipulation:
  - Konva transforms around node offset. Move pivot by setting node.offset({ x, y }).
  - Build a draggable “pivot” handle overlay; when dragged, update node.offset and adjust position so visual position remains constant.
- Bounds (artboard constraints):
  - In boundBoxFunc, clamp x,y,width,height so bbox remains inside a rect (e.g., stage bounds).
- Flip:
  - flipEnabled: true allows flipping. Or allow negative scale via your own controls.
- Multi-select transforms:
  - Transformer can attach to multiple nodes. Konva scales nodes around the common bbox. Limits/snapping are best applied via the shared boundBoxFunc — per-node limits need custom logic on transformend (e.g., re-clamp individual sizes and adjust positions).
- Skew:
  - Transformer doesn’t expose skew handles. If needed, implement custom anchor controls and set node.skewX/skewY from drag deltas (advanced).

Bake scale into width/height on transformend (keep stroke width constant):

```ts
function bakeScale(node: any) {
  const sX = node.scaleX();
  const sY = node.scaleY();
  if (sX !== 1 || sY !== 1) {
    // For Rect-like shapes
    if (typeof node.width === 'function' && typeof node.height === 'function') {
      node.width(node.width() * sX);
      node.height(node.height() * sY);
    }
    // Reset scale
    node.scale({ x: 1, y: 1 });
  }
}
```

--------------------------------------------------------------------------------

All-in-one “RobustTransformer” setup (Svelte + TS)

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Transformer } from 'svelte-konva';
  import { composeBBox, gridSnapBBox, clampSizeBBox, makeKeepRatioBBoxFunc } from './bbox-utils';

  export let target: any;              // Konva node handle to attach
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
  export let bakeScaleOnEnd = false;

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
      anchorSize: 9
    });

    if (keepRatio) ratio = calcRatio(target);

    const funcs = [];
    if (keepRatio) funcs.push(makeKeepRatioBBoxFunc(ratio, { minW, minH, maxW, maxH, centered: centeredScaling }));
    else funcs.push(clampSizeBBox(minW, minH, maxW, maxH));
    if (grid > 0) funcs.push(gridSnapBBox(grid));

    tr.boundBoxFunc(composeBBox(...funcs));

    // Events (transformer and node will both emit)
    const onEnd = () => {
      if (bakeScaleOnEnd) {
        const sX = target.scaleX(), sY = target.scaleY();
        if ((sX !== 1 || sY !== 1) && target.width && target.height) {
          target.width(target.width() * sX);
          target.height(target.height() * sY);
          target.scale({ x: 1, y: 1 });
        }
      }
    };
    tr.on('transformend', onEnd);
    target.on('transformend', onEnd);
  });
</script>

<Transformer bind:handle={tr} />
```

--------------------------------------------------------------------------------

Performance, UX, and integration tips

- Use a dedicated “guides” layer for drawing snap lines; clear only that layer for best performance.
- Use layer.batchDraw() inside transform to throttle redraws.
- Combine event-driven overlays (HUD: size, angle) with transform events.
- With rotations, rely on node.getClientRect() for visual bounds; remember client rect accounts for stroke.
- For high-DPI exports, Stage.toCanvas({ pixelRatio: 2 }) or higher.
- Be consistent: either commit scale into width/height (for crisp strokes) or keep scale as transform (for proportionally scaling everything).

--------------------------------------------------------------------------------

API recap (Transformer / Node)
- Transformer options (non-exhaustive):
  - nodes([...nodes]), enabledAnchors, rotateEnabled, rotateAnchorOffset, rotateLineVisible
  - anchorSize, anchorStroke, anchorFill, anchorStrokeWidth, anchorStyleFunc
  - centeredScaling, keepRatio, padding, ignoreStroke, flipEnabled
  - rotationSnaps([...]), boundBoxFunc((oldBox, newBox) => box)
  - borderEnabled, borderStroke, borderStrokeWidth, borderDash
- Events: transformstart, transform, transformend (on both transformer and attached node)
- Node helpers: position(), absolutePosition(), width()/height(), scaleX()/scaleY(), rotation(), offset({x,y}), getClientRect()

--------------------------------------------------------------------------------

Extending beyond Transformer (when you need “Illustrator-level” custom UI)
- Build your own control layer:
  - Draw a translucent bbox overlay + custom anchor circles/icons + pivot handle
  - Implement drag logic per anchor:
    - For side anchors: adjust width/height (and x/y when not centered)
    - For corner anchors: adjust both (maintain ratio if a modifier is active)
    - For rotation: compute angle from pivot to pointer; set node.rotation()
    - For skew: modify node.skewX/skewY based on pointer deltas
  - Use node.offset as pivot to match Illustrator-style origin workflows
- Pros: unlimited styling and behavior, full keyboard modifiers, custom snapping and constraints
- Cons: you reimplement math and state; start simple (scale/rotate) and expand carefully

--------------------------------------------------------------------------------

Checklist: enabling Illustrator-like details

- Centered scaling (Alt): centeredScaling: true, user can still hold Alt
- Keep ratio: keepRatio: true OR boundBoxFunc
- Rotation snaps: rotationSnaps: [0, 45, 90, ...]
- Grid/object snapping: implement in boundBoxFunc + visual guides layer
- Min/max size: clamp in boundBoxFunc
- Pivot control: custom pivot handle + node.offset
- Bake scale into size: transformend handler
- Constrain axis: show only middle anchors or clamp in boundBoxFunc
- Flip: flipEnabled or allow negative scale via controls
- Multi-select: tr.nodes([...]), apply bbox constraints; optionally re-check per-node post-transform

--------------------------------------------------------------------------------

References
- Transformer events: Transform_Events (transformstart, transform, transformend)
- Centered scaling: Centered_Scaling (centeredScaling or Alt)
- Complex styling: Transformer_Complex_Styling (anchorStyleFunc)
- General snapping patterns: see snapping.md in this repo for drag; apply similar math in boundBoxFunc for transform
