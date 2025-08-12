# Konva Transformations — Professional Transform System (Svelte 5 + TS)

🎯 **Goal**: Production-ready transformation system with advanced features like constraint systems, snap guides, rotation snapping, aspect ratio preservation, and performance optimization. Adobe Illustrator-level precision and UX.

✨ **Features**: Robust transformer with advanced constraints, visual feedback, multi-selection support, keyboard modifiers, transform history, and performance optimization.

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

## 4) Advanced Multi-Selection Transformer

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Transformer } from 'svelte-konva';
  import { composeBBox, gridSnapBBox, clampSizeBBox } from './bbox-utils';

  export let selectedNodes: any[] = [];
  export let showBounds = true;
  export let multiSelectMode: 'individual' | 'group' | 'hybrid' = 'hybrid';
  export let transformMode: 'free' | 'constrained' | 'proportional' = 'free';
  export let onTransformStart: (nodes: any[]) => void = () => {};
  export let onTransformEnd: (nodes: any[]) => void = () => {};

  let tr: any;
  let boundsVisible = true;

  // Advanced transformation state
  let isTransforming = false;
  let transformStartState: Map<any, any> = new Map();
  let groupBounds: { x: number; y: number; width: number; height: number } | null = null;

  function getSelectionBounds(nodes: any[]) {
    if (nodes.length === 0) return null;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const node of nodes) {
      const rect = node.getClientRect();
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    }
    
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  function createTransformGroup(nodes: any[]) {
    // Create a temporary group for multi-selection transforms
    if (nodes.length <= 1) return nodes[0];
    
    const Konva = (window as any).Konva;
    const tempGroup = new Konva.Group();
    const layer = nodes[0].getLayer();
    
    // Store original parents and positions
    nodes.forEach((node, i) => {
      const parent = node.getParent();
      const pos = node.absolutePosition();
      transformStartState.set(node, { parent, pos, index: parent.children.indexOf(node) });
      tempGroup.add(node);
    });
    
    layer.add(tempGroup);
    return tempGroup;
  }

  function restoreFromGroup(tempGroup: any) {
    if (!tempGroup || tempGroup.children.length === 0) return;
    
    const children = [...tempGroup.children];
    children.forEach(node => {
      const state = transformStartState.get(node);
      if (state) {
        tempGroup.remove(node);
        state.parent.add(node);
        // Restore proper layering
        node.moveTo(state.parent, state.index);
      }
    });
    
    tempGroup.destroy();
    transformStartState.clear();
  }

  onMount(async () => {
    await tick();
    updateTransformer();
  });

  $: updateTransformer(selectedNodes);

  function updateTransformer() {
    if (!tr) return;

    if (selectedNodes.length === 0) {
      tr.nodes([]);
      return;
    }

    if (multiSelectMode === 'individual' || selectedNodes.length === 1) {
      // Individual transformation
      tr.nodes(selectedNodes);
      tr.setAttrs({
        enabledAnchors: ['top-left','top-right','bottom-left','bottom-right',
                       'middle-left','middle-right','middle-top','middle-bottom'],
        rotateEnabled: true,
        borderEnabled: showBounds,
        anchorSize: 8,
        anchorStroke: '#0ea5e9',
        anchorFill: 'white',
        anchorStrokeWidth: 2,
        borderStroke: '#0ea5e9',
        borderStrokeWidth: 1,
        borderDash: [4, 4]
      });
    } else {
      // Group transformation
      const tempGroup = createTransformGroup([...selectedNodes]);
      tr.nodes([tempGroup]);
      tr.setAttrs({
        enabledAnchors: ['top-left','top-right','bottom-left','bottom-right'],
        rotateEnabled: false,
        borderEnabled: showBounds,
        anchorSize: 10,
        anchorStroke: '#f59e0b',
        anchorFill: 'white',
        borderStroke: '#f59e0b'
      });
    }

    // Set up transform constraints
    const constraintFuncs = [];
    if (transformMode === 'proportional') {
      constraintFuncs.push(makeKeepRatioBBoxFunc(1, { centered: true }));
    }
    if (transformMode === 'constrained') {
      constraintFuncs.push(gridSnapBBox(10));
    }
    constraintFuncs.push(clampSizeBBox(10, 10, 2000, 2000));
    
    if (constraintFuncs.length > 0) {
      tr.boundBoxFunc(composeBBox(...constraintFuncs));
    }

    // Event handlers
    tr.off('transformstart transformend dragstart dragend');
    tr.on('transformstart', handleTransformStart);
    tr.on('transformend', handleTransformEnd);
    tr.on('dragstart', handleTransformStart);
    tr.on('dragend', handleTransformEnd);
  }

  function handleTransformStart() {
    isTransforming = true;
    transformStartState.clear();
    
    // Store initial state for undo/redo
    selectedNodes.forEach(node => {
      transformStartState.set(node, {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
        width: node.width?.() || 0,
        height: node.height?.() || 0
      });
    });
    
    onTransformStart(selectedNodes);
  }

  function handleTransformEnd() {
    isTransforming = false;
    
    // Bake scale if needed
    selectedNodes.forEach(node => {
      bakeScale(node);
    });
    
    // Clean up group if it was created
    const transformerNodes = tr.nodes();
    if (transformerNodes.length === 1 && transformerNodes[0].getType() === 'Group') {
      const tempGroup = transformerNodes[0];
      if (tempGroup.children && selectedNodes.length > 1) {
        restoreFromGroup(tempGroup);
        tr.nodes(selectedNodes);
      }
    }
    
    onTransformEnd(selectedNodes);
    tr.getLayer()?.batchDraw();
  }
</script>

<Transformer bind:handle={tr} />
```

## 5) Transform History & Undo System

```ts
// transform-history.ts
export interface TransformState {
  nodeId: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  width?: number;
  height?: number;
  timestamp: number;
}

export class TransformHistory {
  private history: TransformState[][] = [];
  private currentIndex = -1;
  private maxHistorySize = 50;
  private nodeIdMap = new WeakMap<any, string>();
  private idCounter = 0;

  private getNodeId(node: any): string {
    if (!this.nodeIdMap.has(node)) {
      this.nodeIdMap.set(node, `node_${++this.idCounter}`);
    }
    return this.nodeIdMap.get(node)!;
  }

  captureState(nodes: any[]): TransformState[] {
    return nodes.map(node => ({
      nodeId: this.getNodeId(node),
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      width: node.width?.(),
      height: node.height?.(),
      timestamp: Date.now()
    }));
  }

  addSnapshot(nodes: any[]) {
    const snapshot = this.captureState(nodes);
    
    // Remove future history if we're not at the end
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new snapshot
    this.history.push(snapshot);
    this.currentIndex = this.history.length - 1;
    
    // Maintain max size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(allNodes: any[]): boolean {
    if (this.currentIndex <= 0) return false;
    
    this.currentIndex--;
    const snapshot = this.history[this.currentIndex];
    this.restoreSnapshot(snapshot, allNodes);
    return true;
  }

  redo(allNodes: any[]): boolean {
    if (this.currentIndex >= this.history.length - 1) return false;
    
    this.currentIndex++;
    const snapshot = this.history[this.currentIndex];
    this.restoreSnapshot(snapshot, allNodes);
    return true;
  }

  private restoreSnapshot(snapshot: TransformState[], allNodes: any[]) {
    const nodeMap = new Map<string, any>();
    allNodes.forEach(node => {
      nodeMap.set(this.getNodeId(node), node);
    });

    snapshot.forEach(state => {
      const node = nodeMap.get(state.nodeId);
      if (node) {
        node.setAttrs({
          x: state.x,
          y: state.y,
          rotation: state.rotation,
          scaleX: state.scaleX,
          scaleY: state.scaleY,
          ...(state.width !== undefined && { width: state.width }),
          ...(state.height !== undefined && { height: state.height })
        });
      }
    });
    
    // Redraw
    if (allNodes.length > 0) {
      allNodes[0].getLayer()?.batchDraw();
    }
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  getHistorySize(): number {
    return this.history.length;
  }
}

// Global transform history instance
export const transformHistory = new TransformHistory();
```

## 6) Keyboard Modifier Support

```ts
// transform-modifiers.ts
export class TransformModifiers {
  private modifierState = {
    shift: false,
    alt: false,
    ctrl: false,
    meta: false
  };

  private listeners: Array<(state: typeof this.modifierState) => void> = [];

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    const updateModifiers = (e: KeyboardEvent) => {
      this.modifierState = {
        shift: e.shiftKey,
        alt: e.altKey,
        ctrl: e.ctrlKey,
        meta: e.metaKey
      };
      this.notifyListeners();
    };

    window.addEventListener('keydown', updateModifiers);
    window.addEventListener('keyup', updateModifiers);
    window.addEventListener('blur', () => {
      // Reset all modifiers when window loses focus
      this.modifierState = { shift: false, alt: false, ctrl: false, meta: false };
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.modifierState));
  }

  subscribe(listener: (state: typeof this.modifierState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) this.listeners.splice(index, 1);
    };
  }

  isShiftHeld(): boolean { return this.modifierState.shift; }
  isAltHeld(): boolean { return this.modifierState.alt; }
  isCtrlHeld(): boolean { return this.modifierState.ctrl; }
  isMetaHeld(): boolean { return this.modifierState.meta; }

  // Transform-specific modifier behaviors
  shouldMaintainAspectRatio(): boolean {
    return this.modifierState.shift;
  }

  shouldTransformFromCenter(): boolean {
    return this.modifierState.alt;
  }

  shouldDisableSnapping(): boolean {
    return this.modifierState.ctrl;
  }

  shouldCloneOnDrag(): boolean {
    return this.modifierState.alt;
  }

  shouldConstrainMovement(): boolean {
    return this.modifierState.shift;
  }
}

// Global modifier manager
export const transformModifiers = new TransformModifiers();
```

## 7) Visual Transform Feedback

```svelte
<script lang="ts">
  // TransformFeedback.svelte - Visual feedback during transforms
  import { onMount, onDestroy } from 'svelte';
  import { Layer, Group, Text, Rect, Line } from 'svelte-konva';

  export let stage: any;
  export let isTransforming = false;
  export let transformingNodes: any[] = [];
  
  let feedbackLayer: any;
  let dimensionText: any;
  let positionText: any;
  let angleText: any;
  let guidelines: any[] = [];
  
  let feedback = {
    dimensions: '',
    position: '',
    rotation: '',
    visible: false
  };

  onMount(() => {
    if (stage) {
      stage.on('transformstart dragstart', handleTransformStart);
      stage.on('transform dragmove', handleTransformMove);
      stage.on('transformend dragend', handleTransformEnd);
    }
  });

  onDestroy(() => {
    if (stage) {
      stage.off('transformstart dragstart transform dragmove transformend dragend');
    }
  });

  function handleTransformStart() {
    feedback.visible = true;
    updateFeedback();
  }

  function handleTransformMove() {
    updateFeedback();
  }

  function handleTransformEnd() {
    feedback.visible = false;
    guidelines = [];
    feedbackLayer?.draw();
  }

  function updateFeedback() {
    if (transformingNodes.length === 0) return;
    
    const node = transformingNodes[0];
    const rect = node.getClientRect();
    
    // Update dimension feedback
    feedback.dimensions = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
    
    // Update position feedback
    feedback.position = `${Math.round(node.x())}, ${Math.round(node.y())}`;
    
    // Update rotation feedback
    const rotation = node.rotation();
    feedback.rotation = `${Math.round(rotation * 180 / Math.PI)}°`;
    
    // Position feedback elements
    if (dimensionText) {
      dimensionText.setAttrs({
        x: rect.x + rect.width / 2,
        y: rect.y - 30,
        text: feedback.dimensions
      });
    }
    
    if (positionText) {
      positionText.setAttrs({
        x: rect.x,
        y: rect.y + rect.height + 20,
        text: feedback.position
      });
    }
    
    if (angleText && Math.abs(rotation) > 0.01) {
      angleText.setAttrs({
        x: rect.x + rect.width,
        y: rect.y - 20,
        text: feedback.rotation,
        visible: true
      });
    } else if (angleText) {
      angleText.visible(false);
    }
    
    feedbackLayer?.batchDraw();
  }
</script>

<Layer bind:handle={feedbackLayer} listening={false}>
  {#if feedback.visible}
    <!-- Dimension display -->
    <Group>
      <Rect 
        x={0} y={-15} 
        width={feedback.dimensions.length * 8} 
        height={20}
        fill="rgba(0,0,0,0.8)" 
        cornerRadius={4}
      />
      <Text 
        bind:handle={dimensionText}
        y={-10}
        text={feedback.dimensions}
        fontSize={12}
        fill="white"
        fontFamily="system-ui"
      />
    </Group>
    
    <!-- Position display -->
    <Group>
      <Rect 
        x={0} y={0} 
        width={feedback.position.length * 7} 
        height={18}
        fill="rgba(0,0,0,0.8)" 
        cornerRadius={4}
      />
      <Text 
        bind:handle={positionText}
        y={3}
        text={feedback.position}
        fontSize={11}
        fill="white"
        fontFamily="system-ui"
      />
    </Group>
    
    <!-- Rotation display -->
    <Group>
      <Rect 
        x={0} y={0} 
        width={feedback.rotation.length * 8} 
        height={18}
        fill="rgba(0,0,0,0.8)" 
        cornerRadius={4}
      />
      <Text 
        bind:handle={angleText}
        y={3}
        text={feedback.rotation}
        fontSize={11}
        fill="white"
        fontFamily="system-ui"
      />
    </Group>
  {/if}
</Layer>
```

## 8) Performance-Optimized Baking Utilities

```ts
// advanced-baking.ts
export function bakeScale(node: any) {
  const sX = node.scaleX();
  const sY = node.scaleY();
  if (Math.abs(sX - 1) < 0.001 && Math.abs(sY - 1) < 0.001) return;
  
  if (typeof node.width === 'function' && typeof node.height === 'function') {
    node.width(node.width() * sX);
    node.height(node.height() * sY);
  }
  
  // Handle stroke width scaling
  if (typeof node.strokeWidth === 'function' && node.strokeWidth() > 0) {
    const avgScale = (sX + sY) / 2;
    node.strokeWidth(node.strokeWidth() * avgScale);
  }
  
  // Handle child transformations for groups
  if (node.children) {
    node.children.forEach((child: any) => {
      if (child.scaleX) {
        child.scaleX(child.scaleX() * sX);
        child.scaleY(child.scaleY() * sY);
      }
    });
  }
  
  node.scale({ x: 1, y: 1 });
}

export function bakeTransforms(nodes: any[]) {
  nodes.forEach(node => {
    bakeScale(node);
    
    // Round positions to avoid sub-pixel rendering
    const x = Math.round(node.x() * 2) / 2;
    const y = Math.round(node.y() * 2) / 2;
    node.position({ x, y });
    
    // Normalize rotation to 0-360 range
    let rotation = node.rotation();
    while (rotation < 0) rotation += Math.PI * 2;
    while (rotation >= Math.PI * 2) rotation -= Math.PI * 2;
    node.rotation(rotation);
  });
}

export function optimizeTransformPerformance(nodes: any[]) {
  // Cache complex nodes during transform
  nodes.forEach(node => {
    const complexity = getNodeComplexity(node);
    if (complexity > 0.7 && !node.isCached()) {
      node.cache();
    }
  });
}

function getNodeComplexity(node: any): number {
  let complexity = 0;
  
  // Base complexity by type
  const type = node.getType();
  switch (type) {
    case 'Group': complexity += 0.3; break;
    case 'Path': complexity += 0.6; break;
    case 'Text': complexity += 0.4; break;
    default: complexity += 0.1;
  }
  
  // Child complexity
  if (node.children) {
    complexity += node.children.length * 0.1;
  }
  
  // Filter complexity
  if (node.filters && node.filters().length > 0) {
    complexity += node.filters().length * 0.2;
  }
  
  // Shadow complexity
  if (node.shadowEnabled && node.shadowEnabled()) {
    complexity += 0.3;
  }
  
  return Math.min(complexity, 1);
}
```

---

## 🚀 Advanced Usage Examples

**Multi-Selection with Constraints**:
```svelte
<RobustTransformer 
  target={selectedNodes}
  multiSelectMode="group"
  transformMode="proportional"
  onTransformEnd={(nodes) => transformHistory.addSnapshot(nodes)}
/>
```

**Keyboard-Aware Transforms**:
```ts
transformModifiers.subscribe((modifiers) => {
  transformer.centeredScaling(modifiers.alt);
  transformer.keepRatio(modifiers.shift);
  if (modifiers.ctrl) transformer.boundBoxFunc(null);
});
```

**Performance Monitoring**:
```ts
PerformanceMonitor.measureOperation('transform_bake', () => {
  bakeTransforms(selectedNodes);
});
```
