# Konva UX — Professional User Interface Patterns (Svelte 5 + Konva)

🎯 **Focus**: Complete professional UX toolkit for canvas applications including advanced viewport controls, intelligent selection systems, contextual interactions, spatial navigation, and performance-optimized rendering.

✨ **Features**: Professional viewport management, multi-touch gestures, advanced selection methods, contextual menus, spatial indexing, gesture recognition, and accessibility support.

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

## 5) Advanced Gesture Recognition & Multi-Touch

```ts
// gesture-manager.ts - Professional touch and gesture handling
export interface GestureEvent {
  type: 'tap' | 'doubletap' | 'pinch' | 'pan' | 'swipe' | 'hold';
  target: any;
  pointers: Array<{ x: number; y: number; id: number }>;
  center: { x: number; y: number };
  scale?: number;
  rotation?: number;
  velocity?: { x: number; y: number };
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export class GestureManager {
  private activePointers = new Map<number, { x: number; y: number; startX: number; startY: number; startTime: number }>();
  private lastTapTime = 0;
  private lastTapPos = { x: 0, y: 0 };
  private isGesturing = false;
  private gestureStartDistance = 0;
  private gestureStartScale = 1;
  private holdTimer: number | null = null;
  
  private listeners: Array<{ type: string; handler: (e: GestureEvent) => void }> = [];

  constructor(private stage: any) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const container = this.stage.container();
    
    container.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    container.addEventListener('pointermove', this.handlePointerMove.bind(this));
    container.addEventListener('pointerup', this.handlePointerUp.bind(this));
    container.addEventListener('pointercancel', this.handlePointerUp.bind(this));
  }

  private handlePointerDown(e: PointerEvent) {
    this.activePointers.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now()
    });

    if (this.activePointers.size === 1) {
      // Start hold timer for single touch
      this.holdTimer = window.setTimeout(() => {
        this.emitGesture({
          type: 'hold',
          target: this.stage.getPointerPosition(),
          pointers: this.getPointerArray(),
          center: this.getCenter()
        });
      }, 500);
    } else if (this.activePointers.size === 2) {
      // Start two-finger gesture
      this.isGesturing = true;
      this.gestureStartDistance = this.getDistance();
      this.gestureStartScale = this.stage.scaleX();
      if (this.holdTimer) {
        clearTimeout(this.holdTimer);
        this.holdTimer = null;
      }
    }
  }

  private handlePointerMove(e: PointerEvent) {
    const pointer = this.activePointers.get(e.pointerId);
    if (!pointer) return;

    pointer.x = e.clientX;
    pointer.y = e.clientY;

    if (this.activePointers.size === 2 && this.isGesturing) {
      // Handle pinch/zoom
      const currentDistance = this.getDistance();
      const scale = (currentDistance / this.gestureStartDistance) * this.gestureStartScale;
      
      this.emitGesture({
        type: 'pinch',
        target: this.stage.getPointerPosition(),
        pointers: this.getPointerArray(),
        center: this.getCenter(),
        scale
      });
    } else if (this.activePointers.size === 1) {
      // Handle pan/drag
      const deltaX = pointer.x - pointer.startX;
      const deltaY = pointer.y - pointer.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > 10) { // Threshold to distinguish from tap
        if (this.holdTimer) {
          clearTimeout(this.holdTimer);
          this.holdTimer = null;
        }
        
        this.emitGesture({
          type: 'pan',
          target: this.stage.getPointerPosition(),
          pointers: this.getPointerArray(),
          center: this.getCenter(),
          velocity: this.calculateVelocity(pointer)
        });
      }
    }
  }

  private handlePointerUp(e: PointerEvent) {
    const pointer = this.activePointers.get(e.pointerId);
    if (!pointer) return;

    const duration = Date.now() - pointer.startTime;
    const deltaX = pointer.x - pointer.startX;
    const deltaY = pointer.y - pointer.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    // Detect tap/double-tap
    if (distance < 10 && duration < 300) {
      const timeSinceLastTap = Date.now() - this.lastTapTime;
      const distanceFromLastTap = Math.sqrt(
        Math.pow(pointer.x - this.lastTapPos.x, 2) + 
        Math.pow(pointer.y - this.lastTapPos.y, 2)
      );

      if (timeSinceLastTap < 300 && distanceFromLastTap < 20) {
        this.emitGesture({
          type: 'doubletap',
          target: this.stage.getPointerPosition(),
          pointers: this.getPointerArray(),
          center: this.getCenter()
        });
      } else {
        this.emitGesture({
          type: 'tap',
          target: this.stage.getPointerPosition(),
          pointers: this.getPointerArray(),
          center: this.getCenter()
        });
      }

      this.lastTapTime = Date.now();
      this.lastTapPos = { x: pointer.x, y: pointer.y };
    }

    // Detect swipe
    if (distance > 50 && duration < 500) {
      const direction = this.getSwipeDirection(deltaX, deltaY);
      this.emitGesture({
        type: 'swipe',
        target: this.stage.getPointerPosition(),
        pointers: this.getPointerArray(),
        center: this.getCenter(),
        direction,
        distance,
        velocity: this.calculateVelocity(pointer)
      });
    }

    this.activePointers.delete(e.pointerId);
    
    if (this.activePointers.size < 2) {
      this.isGesturing = false;
    }
  }

  private getPointerArray() {
    return Array.from(this.activePointers.entries()).map(([id, pointer]) => ({
      id,
      x: pointer.x,
      y: pointer.y
    }));
  }

  private getCenter() {
    const pointers = Array.from(this.activePointers.values());
    const x = pointers.reduce((sum, p) => sum + p.x, 0) / pointers.length;
    const y = pointers.reduce((sum, p) => sum + p.y, 0) / pointers.length;
    return { x, y };
  }

  private getDistance() {
    const pointers = Array.from(this.activePointers.values());
    if (pointers.length < 2) return 0;
    
    const dx = pointers[0].x - pointers[1].x;
    const dy = pointers[0].y - pointers[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getSwipeDirection(deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  private calculateVelocity(pointer: { x: number; y: number; startX: number; startY: number; startTime: number }) {
    const duration = (Date.now() - pointer.startTime) / 1000; // Convert to seconds
    return {
      x: (pointer.x - pointer.startX) / duration,
      y: (pointer.y - pointer.startY) / duration
    };
  }

  private emitGesture(gesture: GestureEvent) {
    this.listeners
      .filter(l => l.type === gesture.type || l.type === '*')
      .forEach(l => l.handler(gesture));
  }

  on(type: string, handler: (e: GestureEvent) => void) {
    this.listeners.push({ type, handler });
    return () => {
      const index = this.listeners.findIndex(l => l.type === type && l.handler === handler);
      if (index >= 0) this.listeners.splice(index, 1);
    };
  }

  destroy() {
    this.activePointers.clear();
    this.listeners = [];
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
    }
  }
}
```

## 6) Professional Viewport Controller

```svelte
<script lang="ts">
  // ViewportController.svelte - Advanced viewport management
  import { onMount, onDestroy } from 'svelte';
  import { Stage, Layer } from 'svelte-konva';
  import { GestureManager } from './gesture-manager';

  export let width = 1000;
  export let height = 700;
  export let minZoom = 0.1;
  export let maxZoom = 5;
  export let zoomSpeed = 0.1;
  export let smoothPanning = true;
  export let boundsPadding = 100;
  export let autoFit = false;
  export let allowNegativeSpace = true;

  let stage: any;
  let gestureManager: GestureManager;
  let animationId: number | null = null;
  
  // Viewport state
  let viewport = {
    x: 0,
    y: 0,
    scale: 1,
    targetX: 0,
    targetY: 0,
    targetScale: 1,
    isAnimating: false
  };

  // Content bounds for auto-fitting
  let contentBounds = { x: 0, y: 0, width: 0, height: 0 };

  onMount(() => {
    if (stage) {
      gestureManager = new GestureManager(stage);
      setupGestureHandlers();
      calculateContentBounds();
      
      if (autoFit) {
        fitToContent();
      }
    }
  });

  onDestroy(() => {
    gestureManager?.destroy();
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });

  function setupGestureHandlers() {
    // Wheel zoom
    stage.on('wheel', handleWheel);
    
    // Gesture-based interactions
    gestureManager.on('pinch', handlePinch);
    gestureManager.on('pan', handlePan);
    gestureManager.on('doubletap', handleDoubleTap);
    gestureManager.on('swipe', handleSwipe);
  }

  function handleWheel(e: any) {
    e.evt.preventDefault();
    
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(minZoom, Math.min(maxZoom, oldScale * (1 + direction * zoomSpeed)));
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    animateViewport(newPos.x, newPos.y, newScale);
  }

  function handlePinch(gesture: any) {
    const newScale = Math.max(minZoom, Math.min(maxZoom, gesture.scale));
    const center = gesture.center;
    
    const mousePointTo = {
      x: (center.x - stage.x()) / stage.scaleX(),
      y: (center.y - stage.y()) / stage.scaleY(),
    };

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };

    setViewportImmediate(newPos.x, newPos.y, newScale);
  }

  function handlePan(gesture: any) {
    if (gesture.pointers.length === 1) {
      // Single finger/mouse pan
      const velocity = gesture.velocity;
      const newX = stage.x() + velocity.x * 0.016; // Assume 60fps
      const newY = stage.y() + velocity.y * 0.016;
      
      if (smoothPanning) {
        animateViewport(newX, newY, stage.scaleX());
      } else {
        setViewportImmediate(newX, newY, stage.scaleX());
      }
    }
  }

  function handleDoubleTap(gesture: any) {
    // Double tap to fit or zoom to cursor
    if (stage.scaleX() === 1) {
      // Zoom in to cursor
      const pointer = gesture.center;
      const newScale = 2;
      const mousePointTo = {
        x: (pointer.x - stage.x()) / stage.scaleX(),
        y: (pointer.y - stage.y()) / stage.scaleY(),
      };
      
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      
      animateViewport(newPos.x, newPos.y, newScale);
    } else {
      fitToContent();
    }
  }

  function handleSwipe(gesture: any) {
    // Swipe for quick navigation
    if (gesture.direction === 'up') {
      // Zoom out
      const newScale = Math.max(minZoom, stage.scaleX() * 0.8);
      animateViewport(viewport.targetX, viewport.targetY, newScale);
    } else if (gesture.direction === 'down') {
      // Zoom in
      const newScale = Math.min(maxZoom, stage.scaleX() * 1.2);
      animateViewport(viewport.targetX, viewport.targetY, newScale);
    }
  }

  function animateViewport(x: number, y: number, scale: number) {
    viewport.targetX = x;
    viewport.targetY = y;
    viewport.targetScale = scale;
    
    if (!viewport.isAnimating) {
      viewport.isAnimating = true;
      smoothUpdate();
    }
  }

  function smoothUpdate() {
    const ease = 0.15;
    let hasChanged = false;

    // Smooth position
    const dx = viewport.targetX - viewport.x;
    const dy = viewport.targetY - viewport.y;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      viewport.x += dx * ease;
      viewport.y += dy * ease;
      hasChanged = true;
    } else {
      viewport.x = viewport.targetX;
      viewport.y = viewport.targetY;
    }

    // Smooth scale
    const dScale = viewport.targetScale - viewport.scale;
    if (Math.abs(dScale) > 0.001) {
      viewport.scale += dScale * ease;
      hasChanged = true;
    } else {
      viewport.scale = viewport.targetScale;
    }

    // Apply to stage
    stage.position({ x: viewport.x, y: viewport.y });
    stage.scale({ x: viewport.scale, y: viewport.scale });

    if (hasChanged) {
      animationId = requestAnimationFrame(smoothUpdate);
    } else {
      viewport.isAnimating = false;
      animationId = null;
    }
  }

  function setViewportImmediate(x: number, y: number, scale: number) {
    viewport.x = viewport.targetX = x;
    viewport.y = viewport.targetY = y;
    viewport.scale = viewport.targetScale = scale;
    
    stage.position({ x, y });
    stage.scale({ x: scale, y: scale });
  }

  function calculateContentBounds() {
    // Find bounds of all content
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    stage.find('Layer').forEach((layer: any) => {
      if (layer.name?.() === 'ui' || layer.name?.() === 'overlay') return; // Skip UI layers
      
      layer.children.forEach((child: any) => {
        const rect = child.getClientRect();
        minX = Math.min(minX, rect.x);
        minY = Math.min(minY, rect.y);
        maxX = Math.max(maxX, rect.x + rect.width);
        maxY = Math.max(maxY, rect.y + rect.height);
      });
    });

    if (minX !== Infinity) {
      contentBounds = {
        x: minX - boundsPadding,
        y: minY - boundsPadding,
        width: maxX - minX + boundsPadding * 2,
        height: maxY - minY + boundsPadding * 2
      };
    }
  }

  function fitToContent() {
    calculateContentBounds();
    
    if (contentBounds.width === 0 || contentBounds.height === 0) return;
    
    const scaleX = width / contentBounds.width;
    const scaleY = height / contentBounds.height;
    const scale = Math.min(scaleX, scaleY, maxZoom);
    
    const x = (width - contentBounds.width * scale) / 2 - contentBounds.x * scale;
    const y = (height - contentBounds.height * scale) / 2 - contentBounds.y * scale;
    
    animateViewport(x, y, scale);
  }

  function resetViewport() {
    animateViewport(0, 0, 1);
  }

  function zoomToSelection(nodes: any[]) {
    if (nodes.length === 0) return;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const rect = node.getClientRect();
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });
    
    const bounds = {
      x: minX - boundsPadding,
      y: minY - boundsPadding,
      width: maxX - minX + boundsPadding * 2,
      height: maxY - minY + boundsPadding * 2
    };
    
    const scaleX = width / bounds.width;
    const scaleY = height / bounds.height;
    const scale = Math.min(scaleX, scaleY, maxZoom);
    
    const x = (width - bounds.width * scale) / 2 - bounds.x * scale;
    const y = (height - bounds.height * scale) / 2 - bounds.y * scale;
    
    animateViewport(x, y, scale);
  }

  // Export functions for external use
  export { fitToContent, resetViewport, zoomToSelection, calculateContentBounds };
</script>

<Stage bind:handle={stage} config={{ width, height }}>
  <slot />
</Stage>
```

## 7) Spatial Indexing for Performance

```ts
// spatial-index.ts - Efficient spatial queries for large canvases
export interface SpatialItem {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  node: any;
}

export class SpatialIndex {
  private items = new Map<string, SpatialItem>();
  private grid = new Map<string, Set<string>>();
  private cellSize: number;
  private gridWidth: number;
  private gridHeight: number;

  constructor(worldWidth = 10000, worldHeight = 10000, cellSize = 200) {
    this.cellSize = cellSize;
    this.gridWidth = Math.ceil(worldWidth / cellSize);
    this.gridHeight = Math.ceil(worldHeight / cellSize);
  }

  private getGridKey(x: number, y: number): string {
    const gx = Math.floor(x / this.cellSize);
    const gy = Math.floor(y / this.cellSize);
    return `${gx},${gy}`;
  }

  private getGridCells(bounds: { x: number; y: number; width: number; height: number }): string[] {
    const cells: string[] = [];
    
    const startX = Math.floor(bounds.x / this.cellSize);
    const startY = Math.floor(bounds.y / this.cellSize);
    const endX = Math.floor((bounds.x + bounds.width) / this.cellSize);
    const endY = Math.floor((bounds.y + bounds.height) / this.cellSize);
    
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        cells.push(`${x},${y}`);
      }
    }
    
    return cells;
  }

  insert(item: SpatialItem) {
    // Remove existing if updating
    if (this.items.has(item.id)) {
      this.remove(item.id);
    }
    
    this.items.set(item.id, item);
    
    // Add to grid cells
    const cells = this.getGridCells(item.bounds);
    cells.forEach(cell => {
      if (!this.grid.has(cell)) {
        this.grid.set(cell, new Set());
      }
      this.grid.get(cell)!.add(item.id);
    });
  }

  remove(id: string) {
    const item = this.items.get(id);
    if (!item) return;
    
    // Remove from grid cells
    const cells = this.getGridCells(item.bounds);
    cells.forEach(cell => {
      const cellItems = this.grid.get(cell);
      if (cellItems) {
        cellItems.delete(id);
        if (cellItems.size === 0) {
          this.grid.delete(cell);
        }
      }
    });
    
    this.items.delete(id);
  }

  query(bounds: { x: number; y: number; width: number; height: number }): SpatialItem[] {
    const candidates = new Set<string>();
    const cells = this.getGridCells(bounds);
    
    cells.forEach(cell => {
      const cellItems = this.grid.get(cell);
      if (cellItems) {
        cellItems.forEach(id => candidates.add(id));
      }
    });
    
    // Filter candidates by actual bounds intersection
    const results: SpatialItem[] = [];
    candidates.forEach(id => {
      const item = this.items.get(id);
      if (item && this.boundsIntersect(bounds, item.bounds)) {
        results.push(item);
      }
    });
    
    return results;
  }

  queryPoint(x: number, y: number): SpatialItem[] {
    const cell = this.getGridKey(x, y);
    const cellItems = this.grid.get(cell);
    if (!cellItems) return [];
    
    const results: SpatialItem[] = [];
    cellItems.forEach(id => {
      const item = this.items.get(id);
      if (item && this.pointInBounds(x, y, item.bounds)) {
        results.push(item);
      }
    });
    
    return results;
  }

  private boundsIntersect(a: { x: number; y: number; width: number; height: number }, 
                         b: { x: number; y: number; width: number; height: number }): boolean {
    return !(a.x + a.width < b.x || b.x + b.width < a.x || 
             a.y + a.height < b.y || b.y + b.height < a.y);
  }

  private pointInBounds(x: number, y: number, bounds: { x: number; y: number; width: number; height: number }): boolean {
    return x >= bounds.x && x < bounds.x + bounds.width &&
           y >= bounds.y && y < bounds.y + bounds.height;
  }

  clear() {
    this.items.clear();
    this.grid.clear();
  }

  getStats() {
    return {
      itemCount: this.items.size,
      gridCellCount: this.grid.size,
      averageItemsPerCell: this.items.size / Math.max(this.grid.size, 1)
    };
  }
}
```

## 8) Professional Context Menu System

```svelte
<script lang="ts">
  // ContextMenu.svelte - Advanced context menu with sub-menus and shortcuts
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fly, fade } from 'svelte/transition';

  interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    shortcut?: string;
    disabled?: boolean;
    separator?: boolean;
    submenu?: MenuItem[];
    action?: () => void;
  }

  export let items: MenuItem[] = [];
  export let x = 0;
  export let y = 0;
  export let visible = false;
  export let theme: 'light' | 'dark' = 'light';

  let menuElement: HTMLElement;
  let activeSubmenu: MenuItem | null = null;
  let submenuTimer: number | null = null;
  let hoveredItem: MenuItem | null = null;
  
  const dispatch = createEventDispatcher<{ 
    select: { item: MenuItem };
    close: {};
  }>();

  onMount(() => {
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleClose);
    
    if (visible && menuElement) {
      adjustPosition();
    }
  });

  onDestroy(() => {
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('wheel', handleClose);
    if (submenuTimer) clearTimeout(submenuTimer);
  });

  function adjustPosition() {
    if (!menuElement) return;
    
    const rect = menuElement.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Adjust horizontal position
    if (x + rect.width > viewport.width) {
      x = Math.max(0, x - rect.width);
    }
    
    // Adjust vertical position
    if (y + rect.height > viewport.height) {
      y = Math.max(0, y - rect.height);
    }
  }

  function handleOutsideClick(e: MouseEvent) {
    if (!menuElement?.contains(e.target as Node)) {
      handleClose();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!visible) return;
    
    switch (e.key) {
      case 'Escape':
        handleClose();
        e.preventDefault();
        break;
      case 'ArrowDown':
        navigateItems(1);
        e.preventDefault();
        break;
      case 'ArrowUp':
        navigateItems(-1);
        e.preventDefault();
        break;
      case 'Enter':
        if (hoveredItem) {
          handleItemClick(hoveredItem);
        }
        e.preventDefault();
        break;
    }
  }

  function navigateItems(direction: 1 | -1) {
    const selectableItems = items.filter(item => !item.separator && !item.disabled);
    if (selectableItems.length === 0) return;
    
    const currentIndex = hoveredItem ? selectableItems.indexOf(hoveredItem) : -1;
    let nextIndex = currentIndex + direction;
    
    if (nextIndex < 0) nextIndex = selectableItems.length - 1;
    if (nextIndex >= selectableItems.length) nextIndex = 0;
    
    hoveredItem = selectableItems[nextIndex];
  }

  function handleItemClick(item: MenuItem) {
    if (item.disabled || item.separator) return;
    
    if (item.submenu) {
      activeSubmenu = item;
      return;
    }
    
    if (item.action) {
      item.action();
    }
    
    dispatch('select', { item });
    handleClose();
  }

  function handleItemHover(item: MenuItem) {
    hoveredItem = item;
    
    if (submenuTimer) {
      clearTimeout(submenuTimer);
    }
    
    if (item.submenu) {
      submenuTimer = window.setTimeout(() => {
        activeSubmenu = item;
      }, 300);
    } else {
      submenuTimer = window.setTimeout(() => {
        activeSubmenu = null;
      }, 100);
    }
  }

  function handleClose() {
    visible = false;
    activeSubmenu = null;
    hoveredItem = null;
    if (submenuTimer) {
      clearTimeout(submenuTimer);
      submenuTimer = null;
    }
    dispatch('close');
  }

  $: if (visible && menuElement) {
    adjustPosition();
  }
</script>

{#if visible}
  <div 
    bind:this={menuElement}
    class="context-menu {theme}"
    style="left: {x}px; top: {y}px;"
    transition:fly={{ y: -10, duration: 150 }}
    role="menu"
    aria-orientation="vertical"
  >
    {#each items as item, index (item.id || index)}
      {#if item.separator}
        <div class="separator" role="separator"></div>
      {:else}
        <div
          class="menu-item"
          class:disabled={item.disabled}
          class:hovered={hoveredItem === item}
          class:has-submenu={!!item.submenu}
          role="menuitem"
          aria-disabled={item.disabled}
          tabindex={item.disabled ? -1 : 0}
          on:click={() => handleItemClick(item)}
          on:mouseenter={() => handleItemHover(item)}
          on:mouseleave={() => hoveredItem = null}
        >
          <div class="item-content">
            {#if item.icon}
              <span class="icon">{item.icon}</span>
            {/if}
            <span class="label">{item.label}</span>
            {#if item.shortcut}
              <span class="shortcut">{item.shortcut}</span>
            {/if}
            {#if item.submenu}
              <span class="submenu-arrow">▶</span>
            {/if}
          </div>
        </div>
      {/if}
    {/each}
    
    {#if activeSubmenu && activeSubmenu.submenu}
      <div 
        class="submenu {theme}"
        style="left: 100%; top: 0;"
        transition:fade={{ duration: 100 }}
      >
        {#each activeSubmenu.submenu as subItem, subIndex (subItem.id || subIndex)}
          {#if subItem.separator}
            <div class="separator" role="separator"></div>
          {:else}
            <div
              class="menu-item"
              class:disabled={subItem.disabled}
              role="menuitem"
              on:click={() => handleItemClick(subItem)}
            >
              <div class="item-content">
                {#if subItem.icon}
                  <span class="icon">{subItem.icon}</span>
                {/if}
                <span class="label">{subItem.label}</span>
                {#if subItem.shortcut}
                  <span class="shortcut">{subItem.shortcut}</span>
                {/if}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .context-menu {
    position: fixed;
    z-index: 10000;
    min-width: 200px;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    padding: 8px 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .context-menu.light {
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    border-color: rgba(0, 0, 0, 0.1);
  }
  
  .context-menu.dark {
    background: rgba(30, 30, 30, 0.95);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .menu-item {
    padding: 0;
    margin: 0 4px;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    transition: background-color 0.15s ease;
  }
  
  .menu-item:not(.disabled):hover,
  .menu-item.hovered {
    background: rgba(0, 123, 255, 0.15);
  }
  
  .menu-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .item-content {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    font-size: 14px;
    gap: 8px;
  }
  
  .icon {
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .label {
    flex: 1;
  }
  
  .shortcut {
    font-size: 12px;
    opacity: 0.7;
    font-family: monospace;
  }
  
  .submenu-arrow {
    font-size: 10px;
    opacity: 0.7;
  }
  
  .separator {
    height: 1px;
    background: rgba(128, 128, 128, 0.3);
    margin: 4px 8px;
  }
  
  .submenu {
    position: absolute;
    min-width: 180px;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    padding: 8px 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .submenu.light {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(0, 0, 0, 0.1);
  }
  
  .submenu.dark {
    background: rgba(30, 30, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
</style>
```

---

## 🚀 Performance & Accessibility Tips

**Performance Optimizations**:
- Use `SpatialIndex` for efficient collision detection
- Implement viewport culling for large scenes
- Debounce expensive operations like bounds calculation
- Use `requestAnimationFrame` for smooth animations
- Cache complex calculations in gesture handlers

**Memory Management**:
- Clean up event listeners in `onDestroy`
- Clear spatial index when nodes are removed
- Dispose of unused animation frames
- Remove pointer tracking for completed gestures

**Accessibility Features**:
- Add keyboard navigation to context menus
- Provide screen reader support with proper ARIA labels
- Support high contrast themes
- Implement focus management for complex interactions
- Ensure minimum touch target sizes (44px) for mobile
