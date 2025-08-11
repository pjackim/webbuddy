# Konva Asset Patterns — Plug-and-Play (Svelte 5 + TypeScript)

Purpose: drop-in, predictable, high-quality asset components for an Illustrator-grade canvas using Konva via svelte-konva. Each snippet does one or two things very well and is ready to paste.

Notes (read first)
- Use `bind:handle` for low-level Konva APIs when needed.
- Prefer binding `config` to sync position/size after `dragend`/`transformend`. Pass `staticConfig` to opt out of auto-sync.
- Guard browser-only logic for SSR (`import.meta.env.SSR`).
- For frequent updates (video/GIF), call `layer.batchDraw()` or run a `Konva.Animation` on the layer.
- For export, ensure CORS headers on images; register fonts if rendering server-side.

## 1) Image — robust load + draggable + export-safe

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Image as KImage } from 'svelte-konva';

  export let src: string;
  export let width = 200;
  export let height = 200;
  export let draggable = true;

  let handle: any; // Konva.Image
  let imageEl: HTMLImageElement;

  onMount(async () => {
    if (import.meta.env.SSR) return;
    imageEl = new Image();
    imageEl.crossOrigin = 'anonymous'; // allow export if server sets CORS
    imageEl.onload = async () => {
      await tick();
      handle.image(imageEl);
      handle.width(width);
      handle.height(height);
      handle.draggable(draggable);
      handle.getLayer()?.batchDraw();
    };
    imageEl.onerror = (e) => console.error('Image load error', e);
    imageEl.src = src;
  });
</script>

<KImage bind:handle={handle} />
```

Options
- Snap/constraints: set `handle.dragBoundFunc(...)`. See snapping section.
- HiDPI export: `stage.toCanvas({ pixelRatio: 2 })`.

## 2) Video — HTMLVideoElement as Image source with Konva.Animation

```svelte
<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { Image as KImage } from 'svelte-konva';

  export let src: string;
  export let loop = true;
  export let autoplay = true;
  export let muted = true;

  let handle: any;
  let videoEl: HTMLVideoElement;
  let anim: any; // Konva.Animation

  onMount(async () => {
    if (import.meta.env.SSR) return;
    await tick();
    videoEl = document.createElement('video');
    Object.assign(videoEl, { src, loop, muted });
    if (autoplay) {
      try { await videoEl.play(); } catch {}
    }
    handle.image(videoEl);
    const layer = handle.getLayer();
    const Konva = (await import('konva')).default;
    anim = new Konva.Animation(() => {}, layer);
    anim.start();
  });

  onDestroy(() => {
    anim?.stop();
    videoEl?.pause();
  });
</script>

<KImage bind:handle={handle} />
```

Notes
- Start/stop the `Konva.Animation` together with the video.
- Use `node.cache()` for static overlays that animate frequently.

## 3) GIF — gifler to canvas, then as Image source

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Image as KImage } from 'svelte-konva';

  export let src: string;
  let handle: any;
  const canvas = document.createElement('canvas');

  onMount(async () => {
    if (import.meta.env.SSR) return;

    // load gifler at runtime to avoid bundling issues
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/gifler@0.1.0/gifler.min.js';
    script.onload = () => {
      // @ts-ignore
      gifler(src).frames(canvas, (ctx: CanvasRenderingContext2D, frame: any) => {
        canvas.width = frame.width;
        canvas.height = frame.height;
        ctx.drawImage(frame.buffer, 0, 0);
        handle.getLayer()?.batchDraw();
      });
    };
    document.head.appendChild(script);

    handle.image(canvas);
  });
</script>

<KImage bind:handle={handle} />
```

Consider converting GIFs to MP4/WebM for performance if acceptable.

## 4) Sprite — sheet + named animations

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Sprite } from 'svelte-konva';

  export let sheetUrl: string;
  export let animations: Record<string, number[]>; // Konva format
  export let animation: string;
  export let frameRate = 12;

  let handle: any;
  const image = new Image();

  onMount(() => {
    image.onload = () => {
      handle.image(image);
      handle.animations(animations);
      handle.animation(animation);
      handle.frameRate(frameRate);
      handle.start();
    };
    image.src = sheetUrl;
  });
</script>

<Sprite bind:handle={handle} />
```

Switch animation: `handle.animation('walk')`. Stop: `handle.stop()`.

## 5) Text — simple, SSR/export notes

```svelte
<script lang="ts">
  import { Text } from 'svelte-konva';

  export let text = 'Hello';
  export let fontFamily = 'Inter, Arial, sans-serif';
  export let fontSize = 18;
  export let fill = '#111';
  export let draggable = true;
</script>

<Text config={{ text, fontFamily, fontSize, fill, draggable }} />
```

Notes
- Server-side export: register fonts with Node canvas before rendering.
- Rich text: render to offscreen canvas (HTML/SVG -> raster) and use as `Image`.

## 6) SVG — three reliable approaches

6.1 Simple: load as raster via Konva.Image

```ts
import Konva from 'konva';
Konva.Image.fromURL('/image.svg', (node) => {
  layer.add(node);
  node.setAttrs({ width: 150, height: 150 });
});
```

6.2 Vector paths: extract `d` attributes and create `Konva.Path` per path (best for crisp vector, but needs parsing).

6.3 Robust rasterization with canvg

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Image as KImage } from 'svelte-konva';

  export let src = 'https://konvajs.org/assets/tiger.svg';
  let handle: any;
  const canvas = document.createElement('canvas');

  onMount(async () => {
    if (import.meta.env.SSR) return;
    const { Canvg } = await import('canvg');
    const ctx = canvas.getContext('2d')!;
    const v = await Canvg.from(ctx, src);
    await v.render();
    handle.image(canvas);
    handle.getLayer()?.batchDraw();
  });
</script>

<KImage bind:handle={handle} />
```

## Optional glue: AssetFactory (typed)

```ts
// asset-factory.ts
export type AssetKind = 'image' | 'video' | 'gif' | 'sprite' | 'text' | 'svg';

export type AssetConfig =
  | { kind: 'image'; src: string; width?: number; height?: number; draggable?: boolean }
  | { kind: 'video'; src: string; loop?: boolean; autoplay?: boolean; muted?: boolean }
  | { kind: 'gif'; src: string }
  | { kind: 'sprite'; sheetUrl: string; animations: Record<string, number[]>; animation: string; frameRate?: number }
  | { kind: 'text'; text: string; fontFamily?: string; fontSize?: number; fill?: string; draggable?: boolean }
  | { kind: 'svg'; src: string; mode?: 'native' | 'canvg' | 'path' };

export function isExternal(url: string) {
  try { const u = new URL(url); return !!u.origin; } catch { return false; }
}
```

Styling + layers
- Put transient guides/hover in a separate layer above content. Set `listening: false` where appropriate.
- Keep CSS for page layout; canvas for visuals.
