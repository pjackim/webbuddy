# Konva Snapping — Notes & Recipes

This file collects the most useful, high-quality snippets and ideas for implementing dragging and snapping behavior with Konva (and using svelte-konva where relevant).

## Summary of key Konva features
- draggable: boolean property on nodes to enable dragging.
- dragBoundFunc(fn): override a node's drag position. The function receives the proposed absolute position and must return an absolute position — ideal for continuous snapping / constraints.
- Events: dragstart, dragmove, dragend — useful for showing guides, computing snap targets, and finalizing snapping.
- absolutePosition() / getClientRect(): helpers for computing edge/center coordinates for snapping.
- stage / layer find & add: use layers for drawing temporary guideline visuals and then remove them on dragend.
- stage.batchDraw() or layer.draw() for efficient redraws.

## Simple snap-to-grid (recommended: dragBoundFunc)
Use dragBoundFunc to round position to nearest grid cell so the node is constrained as it's dragged:

```js
// gridSize: size of grid cell in pixels
const gridSize = 20;

node.draggable(true);
node.dragBoundFunc(function(pos) {
  return {
    x: Math.round(pos.x / gridSize) * gridSize,
    y: Math.round(pos.y / gridSize) * gridSize
  };
});
```

Svelte (svelte-konva) pattern:
- bind handle to access node: <Rect bind:handle={rectNode} />
- set rectNode.dragBoundFunc(...) in onMount or after tick()

## Snap-to-nearest-on-dragend (alternative)
If you prefer not to constrain during drag, snap at the end:

- Listen to dragend
- Compute snapped position (round to grid or nearest anchor)
- Set node.position(snappedPos) and call layer.batchDraw()

```js
node.on('dragend', () => {
  const pos = node.position();
  node.position({
    x: Math.round(pos.x / gridSize) * gridSize,
    y: Math.round(pos.y / gridSize) * gridSize
  });
  layer.batchDraw();
});
```

## Snap-to-other-objects with visual guides (based on Konva Objects_Snapping demo)
Core steps:
1. Build "guide stops": x/y positions to which we can snap (stage borders, centers, and edges/centers of other objects).
2. For the dragging target, compute its snapping edges/points (start/center/end for horizontal/vertical).
3. During dragmove:
   - Compute closest guides within a tolerance (GUIDELINE_OFFSET).
   - Draw temporary guide lines (use a dedicated layer or shape with name like 'guid-line').
   - Force the object's absolutePosition to snap position while dragging for immediate feedback.
4. On dragend: remove guides.

Key pieces (conceptual):

- getLineGuideStops(skipShape): returns arrays of candidate x and y guide coordinates (stage edges/centers + other objects' edges/centers).
- getObjectSnappingEdges(node): returns the node's own snapping anchors with offsets that allow converting guide coordinate -> absolute position for the node.
- getGuides(lineGuideStops, itemBounds): returns the nearest guides within tolerance.
- drawGuides(guides): add dashed lines to the layer to visualize snaps.

Example (extracted/condensed logic):

```js
const GUIDELINE_OFFSET = 5;

function getLineGuideStops(skipShape) {
  const vertical = [0, stage.width() / 2, stage.width()];
  const horizontal = [0, stage.height() / 2, stage.height()];
  stage.find('.object').forEach((guideItem) => {
    if (guideItem === skipShape) return;
    const box = guideItem.getClientRect();
    vertical.push(box.x, box.x + box.width, box.x + box.width / 2);
    horizontal.push(box.y, box.y + box.height, box.y + box.height / 2);
  });
  return { vertical, horizontal };
}

function getObjectSnappingEdges(node) {
  const box = node.getClientRect();
  const absPos = node.absolutePosition();
  return {
    vertical: [
      { guide: Math.round(box.x), offset: Math.round(absPos.x - box.x), snap: 'start' },
      { guide: Math.round(box.x + box.width / 2), offset: Math.round(absPos.x - box.x - box.width / 2), snap: 'center' },
      { guide: Math.round(box.x + box.width), offset: Math.round(absPos.x - box.x - box.width), snap: 'end' },
    ],
    horizontal: [
      { guide: Math.round(box.y), offset: Math.round(absPos.y - box.y), snap: 'start' },
      { guide: Math.round(box.y + box.height / 2), offset: Math.round(absPos.y - box.y - box.height / 2), snap: 'center' },
      { guide: Math.round(box.y + box.height), offset: Math.round(absPos.y - box.y - box.height), snap: 'end' },
    ]
  };
}

function getGuides(lineGuideStops, itemBounds) {
  const resultV = [];
  const resultH = [];
  lineGuideStops.vertical.forEach(lineGuide => {
    itemBounds.vertical.forEach(itemBound => {
      const diff = Math.abs(lineGuide - itemBound.guide);
      if (diff < GUIDELINE_OFFSET) {
        resultV.push({ lineGuide, diff, snap: itemBound.snap, offset: itemBound.offset });
      }
    });
  });
  lineGuideStops.horizontal.forEach(lineGuide => {
    itemBounds.horizontal.forEach(itemBound => {
      const diff = Math.abs(lineGuide - itemBound.guide);
      if (diff < GUIDELINE_OFFSET) {
        resultH.push({ lineGuide, diff, snap: itemBound.snap, offset: itemBound.offset });
      }
    });
  });

  const guides = [];
  const minV = resultV.sort((a,b) => a.diff - b.diff)[0];
  const minH = resultH.sort((a,b) => a.diff - b.diff)[0];
  if (minV) guides.push({ lineGuide: minV.lineGuide, offset: minV.offset, orientation: 'V', snap: minV.snap });
  if (minH) guides.push({ lineGuide: minH.lineGuide, offset: minH.offset, orientation: 'H', snap: minH.snap });
  return guides;
}
```

During dragmove you can:
- clear old 'guid-line' shapes
- compute lineGuideStops and itemBounds, then guides
- draw dashed lines for guides
- compute new absolutePos and call e.target.absolutePosition(absPos)
- call layer.batchDraw() for efficient render

On dragend:
- remove the 'guid-line' shapes

## Using Svelte + svelte-konva
- Bind the Konva node: <Rect bind:handle={rect} config={{draggable: true}} />
- Set dragBoundFunc or attach node.on('dragmove', ...) after rect is defined (use onMount + tick())
- Keep config binding in mind: svelte-konva will sync config after dragend/transformend. If you want to manage position via your own logic, either update the bound config accordingly or pass staticConfig to opt out of automatic sync.

Example Svelte snippet (grid dragBoundFunc):

```svelte
<script>
  import { onMount, tick } from 'svelte';
  import { Stage, Layer, Rect } from 'svelte-konva';

  let rectNode;
  const gridSize = 20;

  onMount(async () => {
    await tick();
    rectNode.draggable(true);
    rectNode.dragBoundFunc(function(pos) {
      return {
        x: Math.round(pos.x / gridSize) * gridSize,
        y: Math.round(pos.y / gridSize) * gridSize
      };
    });
  });
</script>

<Stage config={{ width: 800, height: 600 }}>
  <Layer>
    <Rect bind:handle={rectNode} config={{ x: 50, y: 50, width: 100, height: 80, fill: 'blue' }} />
  </Layer>
</Stage>
```

## Transformer + snapping
- When using Konva.Transformer for resize/rotate, snapping requires special handling:
  - Compute guides based on the transformed shape's bounding box (getClientRect()).
  - Attach guides logic to transformer change events (transform and transformend) if you want snapping during transform.
  - Alternatively, snap on transformend.

## Performance & UX tips
- Use a dedicated "guides" layer and clear only its children instead of redrawing all shapes.
- Use layer.batchDraw() when updating frequently (dragmove) for smoother performance.
- Keep GUIDELINE_OFFSET configurable; smaller values = stricter snapping.
- For many objects, limit search scope (e.g., spatial index or only nearby objects) to avoid O(n^2) work on dragmove.
- Provide option to toggle snapping (e.g., hold modifier key to temporarily disable snapping).

## References / Links
- Konva API: Node.draggable, Node.dragBoundFunc, events (dragstart/dragmove/dragend)
- Konva demo: Objects_Snapping (guides & snap-to-edges example)
- Community post: "Snap to grid with KonvaJS" (useful patterns / alternatives)

## Ready-to-use patterns
1. Snap-to-grid during drag: dragBoundFunc rounding (simple, robust)
2. Snap-on-dragend: dragend rounding (non-intrusive during dragging)
3. Snap-to-objects with guidelines: compute guide stops & offsets, show visual guides, force absolutePosition during dragmove (most polished UX)
4. Transformer snapping: snap at transformend or implement continuous snapping by recalculating bounds during transform

---

Saved at frontend/konva-notes/snapping.md (this file).
