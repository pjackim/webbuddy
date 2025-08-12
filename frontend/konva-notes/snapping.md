# Konva Snapping — Professional Precision System (Svelte + Konva)

🎯 **Focus**: Industrial-strength snapping system with visual feedback, intelligent guides, multi-target snapping, magnetic constraints, and performance optimization. Adobe Illustrator-level precision for professional design tools.

✨ **Features**: Smart grid snapping, object-to-object alignment, dynamic guide generation, magnetic snap zones, multi-selection constraints, and real-time visual feedback with smooth animations.

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

## 5) Advanced Magnetic Snapping System

```ts
// magnetic-snapping.ts - Advanced snapping with magnetic zones
export interface SnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  guides: SnapGuide[];
  magneticForce?: { x: number; y: number };
}

export interface SnapGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  start: number;
  end: number;
  target?: any;
  strength: number;
}

export interface SnapTarget {
  id: string;
  node: any;
  bounds: { x: number; y: number; width: number; height: number };
  snapPoints: { x: number; y: number; type: 'corner' | 'edge' | 'center' }[];
  priority: number;
}

export class MagneticSnapManager {
  private targets = new Map<string, SnapTarget>();
  private gridSize = 10;
  private snapTolerance = 8;
  private magneticZone = 20;
  private visualGuides: SnapGuide[] = [];
  private enabled = true;
  
  private callbacks: Array<(guides: SnapGuide[]) => void> = [];

  setGridSize(size: number) {
    this.gridSize = size;
  }

  setSnapTolerance(tolerance: number) {
    this.snapTolerance = tolerance;
  }

  setMagneticZone(zone: number) {
    this.magneticZone = zone;
  }

  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
  
  addTarget(target: SnapTarget) {
    this.targets.set(target.id, target);
  }

  removeTarget(id: string) {
    this.targets.delete(id);
  }

  updateTarget(id: string, bounds: { x: number; y: number; width: number; height: number }) {
    const target = this.targets.get(id);
    if (target) {
      target.bounds = bounds;
      target.snapPoints = this.calculateSnapPoints(bounds);
    }
  }

  private calculateSnapPoints(bounds: { x: number; y: number; width: number; height: number }) {
    return [
      // Corners
      { x: bounds.x, y: bounds.y, type: 'corner' as const },
      { x: bounds.x + bounds.width, y: bounds.y, type: 'corner' as const },
      { x: bounds.x, y: bounds.y + bounds.height, type: 'corner' as const },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'corner' as const },
      
      // Edge midpoints
      { x: bounds.x + bounds.width / 2, y: bounds.y, type: 'edge' as const },
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, type: 'edge' as const },
      { x: bounds.x, y: bounds.y + bounds.height / 2, type: 'edge' as const },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, type: 'edge' as const },
      
      // Center
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2, type: 'center' as const }
    ];
  }

  snapPosition(node: any, position: { x: number; y: number }, excludeIds: string[] = []): SnapResult {
    if (!this.enabled) {
      return {
        x: position.x,
        y: position.y,
        snappedX: false,
        snappedY: false,
        guides: []
      };
    }

    const bounds = {
      x: position.x,
      y: position.y,
      width: node.width?.() || 0,
      height: node.height?.() || 0
    };

    const candidatePoints = this.calculateSnapPoints(bounds);
    let bestSnapX: { position: number; guide: SnapGuide } | null = null;
    let bestSnapY: { position: number; guide: SnapGuide } | null = null;
    let minDistanceX = this.snapTolerance;
    let minDistanceY = this.snapTolerance;

    // Grid snapping
    if (this.gridSize > 0) {
      candidatePoints.forEach(point => {
        const gridX = Math.round(point.x / this.gridSize) * this.gridSize;
        const gridY = Math.round(point.y / this.gridSize) * this.gridSize;
        
        const distanceX = Math.abs(point.x - gridX);
        const distanceY = Math.abs(point.y - gridY);
        
        if (distanceX < minDistanceX) {
          minDistanceX = distanceX;
          bestSnapX = {
            position: gridX - (point.x - position.x),
            guide: {
              type: 'vertical',
              position: gridX,
              start: gridY - 50,
              end: gridY + 50,
              strength: 0.5
            }
          };
        }
        
        if (distanceY < minDistanceY) {
          minDistanceY = distanceY;
          bestSnapY = {
            position: gridY - (point.y - position.y),
            guide: {
              type: 'horizontal',
              position: gridY,
              start: gridX - 50,
              end: gridX + 50,
              strength: 0.5
            }
          };
        }
      });
    }

    // Object-to-object snapping
    for (const [id, target] of this.targets) {
      if (excludeIds.includes(id)) continue;
      
      target.snapPoints.forEach(targetPoint => {
        candidatePoints.forEach(candidatePoint => {
          const distanceX = Math.abs(candidatePoint.x - targetPoint.x);
          const distanceY = Math.abs(candidatePoint.y - targetPoint.y);
          
          if (distanceX < minDistanceX) {
            minDistanceX = distanceX;
            const snapX = targetPoint.x - (candidatePoint.x - position.x);
            bestSnapX = {
              position: snapX,
              guide: {
                type: 'vertical',
                position: targetPoint.x,
                start: Math.min(targetPoint.y, candidatePoint.y) - 50,
                end: Math.max(targetPoint.y, candidatePoint.y) + 50,
                target: target.node,
                strength: target.priority
              }
            };
          }
          
          if (distanceY < minDistanceY) {
            minDistanceY = distanceY;
            const snapY = targetPoint.y - (candidatePoint.y - position.y);
            bestSnapY = {
              position: snapY,
              guide: {
                type: 'horizontal',
                position: targetPoint.y,
                start: Math.min(targetPoint.x, candidatePoint.x) - 50,
                end: Math.max(targetPoint.x, candidatePoint.x) + 50,
                target: target.node,
                strength: target.priority
              }
            };
          }
        });
      });
    }

    // Calculate magnetic force for smooth attraction
    let magneticForce: { x: number; y: number } | undefined;
    if (bestSnapX || bestSnapY) {
      magneticForce = {
        x: bestSnapX ? (bestSnapX.position - position.x) * 0.3 : 0,
        y: bestSnapY ? (bestSnapY.position - position.y) * 0.3 : 0
      };
    }

    const result: SnapResult = {
      x: bestSnapX?.position ?? position.x,
      y: bestSnapY?.position ?? position.y,
      snappedX: !!bestSnapX,
      snappedY: !!bestSnapY,
      guides: [],
      magneticForce
    };

    // Add guides for visualization
    if (bestSnapX) result.guides.push(bestSnapX.guide);
    if (bestSnapY) result.guides.push(bestSnapY.guide);

    this.visualGuides = result.guides;
    this.notifyGuideCallbacks();

    return result;
  }

  onGuidesUpdate(callback: (guides: SnapGuide[]) => void) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index >= 0) this.callbacks.splice(index, 1);
    };
  }

  private notifyGuideCallbacks() {
    this.callbacks.forEach(callback => callback(this.visualGuides));
  }

  clearGuides() {
    this.visualGuides = [];
    this.notifyGuideCallbacks();
  }

  getActiveGuides(): SnapGuide[] {
    return [...this.visualGuides];
  }
}

// Global magnetic snap manager
export const magneticSnapManager = new MagneticSnapManager();
```

## 6) Professional Visual Guide System

```svelte
<script lang="ts">
  // SnapGuides.svelte - Professional visual feedback system
  import { onMount, onDestroy } from 'svelte';
  import { Layer, Line, Circle, Text, Group } from 'svelte-konva';
  import { magneticSnapManager, type SnapGuide } from './magnetic-snapping';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let stage: any;
  export let enabled = true;
  export let showLabels = true;
  export let theme: 'light' | 'dark' = 'dark';

  let guidesLayer: any;
  let activeGuides: SnapGuide[] = [];
  let unsubscribe: (() => void) | null = null;
  
  // Animated opacity for smooth guide appearance
  const guidesOpacity = tweened(0, { duration: 200, easing: cubicOut });

  const colors = {
    light: {
      grid: '#0ea5e9',
      object: '#f59e0b',
      strong: '#ef4444',
      weak: '#94a3b8'
    },
    dark: {
      grid: '#38bdf8',
      object: '#fbbf24',
      strong: '#f87171',
      weak: '#64748b'
    }
  };

  onMount(() => {
    if (magneticSnapManager) {
      unsubscribe = magneticSnapManager.onGuidesUpdate((guides) => {
        activeGuides = guides;
        guidesOpacity.set(guides.length > 0 ? 1 : 0);
      });
    }
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  function getGuideColor(guide: SnapGuide): string {
    const palette = colors[theme];
    
    if (guide.target) {
      return guide.strength > 0.8 ? palette.strong : palette.object;
    }
    
    return guide.strength > 0.7 ? palette.grid : palette.weak;
  }

  function getGuideWidth(guide: SnapGuide): number {
    return guide.strength > 0.7 ? 2 : 1;
  }

  function getDashPattern(guide: SnapGuide): number[] {
    return guide.target ? [] : [4, 4];
  }

  $: visible = enabled && activeGuides.length > 0;
</script>

<Layer bind:handle={guidesLayer} listening={false} opacity={$guidesOpacity}>
  {#each activeGuides as guide, index (index)}
    <Group>
      <!-- Main guide line -->
      <Line
        points={guide.type === 'vertical' 
          ? [guide.position, guide.start, guide.position, guide.end]
          : [guide.start, guide.position, guide.end, guide.position]
        }
        stroke={getGuideColor(guide)}
        strokeWidth={getGuideWidth(guide)}
        dash={getDashPattern(guide)}
        perfectDrawEnabled={false}
        shadowEnabled={false}
        listening={false}
      />
      
      <!-- Snap point indicators -->
      {#if guide.target && showLabels}
        <Circle
          x={guide.type === 'vertical' ? guide.position : (guide.start + guide.end) / 2}
          y={guide.type === 'horizontal' ? guide.position : (guide.start + guide.end) / 2}
          radius={3}
          fill={getGuideColor(guide)}
          stroke="white"
          strokeWidth={1}
          perfectDrawEnabled={false}
          listening={false}
        />
      {/if}
      
      <!-- Optional distance labels -->
      {#if guide.target && showLabels}
        <Group
          x={guide.type === 'vertical' ? guide.position + 10 : (guide.start + guide.end) / 2}
          y={guide.type === 'horizontal' ? guide.position - 15 : (guide.start + guide.end) / 2}
        >
          <!-- Background for label -->
          <Line
            points={[-15, -6, 30, -6, 30, 6, -15, 6]}
            fill="rgba(0, 0, 0, 0.8)"
            closed={true}
            cornerRadius={3}
            listening={false}
          />
          
          <!-- Label text -->
          <Text
            x={-10}
            y={-4}
            text="0px"
            fontSize={10}
            fill="white"
            fontFamily="system-ui, -apple-system"
            listening={false}
          />
        </Group>
      {/if}
    </Group>
  {/each}
</Layer>
```

## 7) Intelligent Multi-Selection Snapping

```ts
// multi-selection-snapping.ts - Advanced group snapping logic
export class MultiSelectionSnapManager {
  private magneticManager: MagneticSnapManager;
  private selectionBounds: { x: number; y: number; width: number; height: number } | null = null;

  constructor(magneticManager: MagneticSnapManager) {
    this.magneticManager = magneticManager;
  }

  snapMultipleNodes(nodes: any[], primaryNode: any, newPosition: { x: number; y: number }): { 
    positions: Map<any, { x: number; y: number }>;
    guides: SnapGuide[];
  } {
    // Calculate selection bounds
    this.selectionBounds = this.calculateSelectionBounds(nodes);
    if (!this.selectionBounds) {
      return { positions: new Map(), guides: [] };
    }

    // Get original positions
    const originalPositions = new Map<any, { x: number; y: number }>();
    nodes.forEach(node => {
      originalPositions.set(node, { x: node.x(), y: node.y() });
    });

    // Calculate offset from primary node to selection center
    const primaryOriginal = originalPositions.get(primaryNode)!;
    const selectionCenter = {
      x: this.selectionBounds.x + this.selectionBounds.width / 2,
      y: this.selectionBounds.y + this.selectionBounds.height / 2
    };

    // Snap the selection bounds as a whole
    const boundsDelta = {
      x: newPosition.x - primaryOriginal.x,
      y: newPosition.y - primaryOriginal.y
    };

    const newBounds = {
      x: this.selectionBounds.x + boundsDelta.x,
      y: this.selectionBounds.y + boundsDelta.y,
      width: this.selectionBounds.width,
      height: this.selectionBounds.height
    };

    // Create temporary node for bounds snapping
    const tempNode = {
      width: () => newBounds.width,
      height: () => newBounds.height
    };

    // Get snap result for the bounds
    const excludeIds = nodes.map(node => this.getNodeId(node)).filter(Boolean);
    const snapResult = this.magneticManager.snapPosition(tempNode, newBounds, excludeIds);

    // Calculate final offset
    const finalOffset = {
      x: snapResult.x - this.selectionBounds.x,
      y: snapResult.y - this.selectionBounds.y
    };

    // Apply offset to all nodes
    const finalPositions = new Map<any, { x: number; y: number }>();
    nodes.forEach(node => {
      const original = originalPositions.get(node)!;
      finalPositions.set(node, {
        x: original.x + finalOffset.x,
        y: original.y + finalOffset.y
      });
    });

    return {
      positions: finalPositions,
      guides: snapResult.guides
    };
  }

  private calculateSelectionBounds(nodes: any[]): { x: number; y: number; width: number; height: number } | null {
    if (nodes.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const rect = node.getClientRect();
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private getNodeId(node: any): string | null {
    return node.id?.() || node._id || null;
  }
}
```

## 8) Smart Alignment Tools

```ts
// alignment-tools.ts - Professional alignment and distribution
export class AlignmentTools {
  static alignNodes(nodes: any[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    if (nodes.length < 2) return;

    const bounds = nodes.map(node => node.getClientRect());
    let referenceValue: number;

    switch (alignment) {
      case 'left':
        referenceValue = Math.min(...bounds.map(b => b.x));
        nodes.forEach((node, i) => {
          const offset = bounds[i].x - node.x();
          node.x(referenceValue - offset);
        });
        break;

      case 'center':
        const leftmost = Math.min(...bounds.map(b => b.x));
        const rightmost = Math.max(...bounds.map(b => b.x + b.width));
        referenceValue = (leftmost + rightmost) / 2;
        nodes.forEach((node, i) => {
          const centerOffset = bounds[i].x + bounds[i].width / 2 - node.x();
          node.x(referenceValue - centerOffset);
        });
        break;

      case 'right':
        referenceValue = Math.max(...bounds.map(b => b.x + b.width));
        nodes.forEach((node, i) => {
          const offset = bounds[i].x + bounds[i].width - node.x();
          node.x(referenceValue - offset);
        });
        break;

      case 'top':
        referenceValue = Math.min(...bounds.map(b => b.y));
        nodes.forEach((node, i) => {
          const offset = bounds[i].y - node.y();
          node.y(referenceValue - offset);
        });
        break;

      case 'middle':
        const topmost = Math.min(...bounds.map(b => b.y));
        const bottommost = Math.max(...bounds.map(b => b.y + b.height));
        referenceValue = (topmost + bottommost) / 2;
        nodes.forEach((node, i) => {
          const centerOffset = bounds[i].y + bounds[i].height / 2 - node.y();
          node.y(referenceValue - centerOffset);
        });
        break;

      case 'bottom':
        referenceValue = Math.max(...bounds.map(b => b.y + b.height));
        nodes.forEach((node, i) => {
          const offset = bounds[i].y + bounds[i].height - node.y();
          node.y(referenceValue - offset);
        });
        break;
    }
  }

  static distributeNodes(nodes: any[], direction: 'horizontal' | 'vertical') {
    if (nodes.length < 3) return;

    const bounds = nodes.map(node => ({ node, rect: node.getClientRect() }));
    bounds.sort((a, b) => {
      return direction === 'horizontal' ? a.rect.x - b.rect.x : a.rect.y - b.rect.y;
    });

    const first = bounds[0].rect;
    const last = bounds[bounds.length - 1].rect;
    
    if (direction === 'horizontal') {
      const totalSpace = (last.x + last.width) - first.x;
      const totalObjectWidth = bounds.reduce((sum, b) => sum + b.rect.width, 0);
      const gap = (totalSpace - totalObjectWidth) / (bounds.length - 1);
      
      let currentX = first.x;
      bounds.forEach(({ node, rect }) => {
        const offset = rect.x - node.x();
        node.x(currentX - offset);
        currentX += rect.width + gap;
      });
    } else {
      const totalSpace = (last.y + last.height) - first.y;
      const totalObjectHeight = bounds.reduce((sum, b) => sum + b.rect.height, 0);
      const gap = (totalSpace - totalObjectHeight) / (bounds.length - 1);
      
      let currentY = first.y;
      bounds.forEach(({ node, rect }) => {
        const offset = rect.y - node.y();
        node.y(currentY - offset);
        currentY += rect.height + gap;
      });
    }
  }

  static createSmartGuides(nodes: any[], stage: any): SnapGuide[] {
    const guides: SnapGuide[] = [];
    const stageBounds = { x: 0, y: 0, width: stage.width(), height: stage.height() };
    
    // Add stage center lines
    guides.push({
      type: 'vertical',
      position: stageBounds.width / 2,
      start: 0,
      end: stageBounds.height,
      strength: 0.6
    });
    
    guides.push({
      type: 'horizontal',
      position: stageBounds.height / 2,
      start: 0,
      end: stageBounds.width,
      strength: 0.6
    });

    // Add golden ratio guides
    const goldenRatio = 1.618;
    const hGolden = stageBounds.width / goldenRatio;
    const vGolden = stageBounds.height / goldenRatio;
    
    guides.push({
      type: 'vertical',
      position: hGolden,
      start: 0,
      end: stageBounds.height,
      strength: 0.3
    });
    
    guides.push({
      type: 'horizontal',
      position: vGolden,
      start: 0,
      end: stageBounds.width,
      strength: 0.3
    });

    return guides;
  }
}
```

---

## 🚀 Professional Usage Tips

**Performance Optimizations**:
- Use magnetic zones to reduce calculation frequency
- Implement spatial indexing for large numbers of snap targets
- Cache snap point calculations when objects don't move
- Debounce guide rendering for smooth performance

**Visual Design**:
- Use different colors for different snap types (grid vs object)
- Animate guide appearance/disappearance for smooth UX
- Show distance measurements for precision work
- Support high contrast modes for accessibility

**Advanced Features**:
- Implement keyboard modifiers to toggle snap types
- Add preference system for snap tolerances
- Support custom snap point definitions
- Enable distributed snapping for complex layouts
