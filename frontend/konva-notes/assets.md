# Konva Asset Types — Clean Notes (Svelte + TS + CSS)

Purpose: robust, reliable, extensible patterns for assets (Image/Photo, Video, GIF, Sprite, Text, SVG) using Konva + svelte-konva.

Sources reviewed:
- svelte-konva overview: events, bind:handle, config syncing — see local README at docs/svelte-konva-docs.md
- Konva docs and sandboxes: Image, Sprite, Text, SVG on Canvas, GIF on Canvas

General Svelte + svelte-konva patterns
- Always bind the node handle to access Konva APIs.
- Use onMount + tick to ensure handle is defined before mutation.
- Avoid SSR pitfalls by dynamically importing browser-only libs (canvg, gifler) and guarding with import.meta.env.SSR.
- Batch redraws with layer.batchDraw() or Konva.Animation during frequent updates (dragging/video/GIF).
- For exports, ensure CORS headers on images, and register fonts on server (Node canvas) if exporting text.

1) Image / Photo (Konva.Image)
Intent: load reliably with CORS, expose events, support drag/snap, ready for export.

Svelte component (ImageAsset.svelte):

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Image as KImage, Layer, Stage } from 'svelte-konva';
  let handle: any; // underlying Konva.Image
  export let src: string;
  export let width = 200;
  export let height = 200;
  export let draggable = true;
  let imageEl: HTMLImageElement;
  async function load() {
    imageEl = new Image();
    imageEl.crossOrigin = 'anonymous'; // allow export if server provides CORS
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
  }
  onMount(load);
</script>

<KImage bind:handle={handle} />
```

Notes:
- Use dragBoundFunc for constraints/snap if needed; see snapping.md.
- For high-DPI export, consider Stage.toCanvas({ pixelRatio: 2 }).

2) Video as Image source
Intent: play an HTMLVideoElement through Konva.Image with animation loop.

```svelte
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Image as KImage } from 'svelte-konva';
  let handle: any;
  export let src: string;
  export let loop = true;
  export let autoplay = true;
  export let muted = true;
  let videoEl: HTMLVideoElement;
  let anim: any; // Konva.Animation
  onMount(async () => {
    await tick();
   videoEl = document.createElement('video');
    videoEl.src = src;
    videoEl.loop = loop;
    videoEl.autoplay = autoplay;
    videoEl.muted = muted;
    await videoEl.play().catch(() => {});
    handle.image(videoEl);
    const layer = handle.getLayer();
    const Konva = (await import('konva')).default;
    anim = new Konva.Animation(() => {}, layer);
    anim.start();
  });
</script>

<KImage bind:handle={handle} />
```

Notes:
- Prefer Konva.Animation over requestAnimationFrame to tie updates to layer.
- Manage pause/resume by anim.stop()/anim.start() and videoEl.pause()/play().

3) Animated GIF (via GIF parser -> canvas -> Konva.Image)
Intent: robust GIF playback by parsing frames to a canvas, then use that canvas as image source.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Image as KImage } from 'svelte-konva';
  let handle: any;
  export let src: string;
  const canvas = document.createElement('canvas');
  onMount(async () => {
    if (import.meta.env.SSR) return;
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

Notes:
- Alternative: convert GIF to sprite sheet or MP4/WebM; see Sprite or Video patterns.

4) Sprite sheet animations (Konva.Sprite)
Intent: precise, controllable frame animation.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Sprite } from 'svelte-konva';
  let handle: any;
  export let sheetUrl: string;
  export let animations: Record<string, number[]>;
  export let animation: string;
  export let frameRate = 12;
  const image = new Image();
  onMount(() => {
    image.src = sheetUrl;
    image.onload = () => {
      handle.image(image);
      handle.animations(animations);
      handle.animation(animation);
      handle.frameRate(frameRate);
      handle.start();
    };
  });
</script>

<Sprite bind:handle={handle} />
```

Notes:
- Stop with handle.stop(), switch sequences with handle.animation('walk'), listen to frameIndexChange as in Konva demo.

5) Text (Konva.Text)
Intent: predictable fonts, SSR-safe exports.

```svelte
<script lang="ts">
  import { Text } from 'svelte-konva';
  export let text = 'Hello';
  export let fontFamily = 'Inter, Arial, sans-serif';
  export let fontSize = 18;
  export let fill = '#111';
  export let draggable = true;
</script>

<Text
  config={{ text, fontFamily, fontSize, fill, draggable }}
/>
```

Notes:
- For Node exports, register fonts using canvas.registerFont before rendering.
- For rich text, consider manual layout or render HTML to canvas and use as Image.

6) SVG (three reliable strategies)
6.1 Native via Konva.Image (simple SVGs)

```ts
import Konva from 'konva';
Konva.Image.fromURL('/image.svg', (node) => {
  layer.add(node);
  node.setAttrs({ width: 150, height: 150 });
});
```

6.2 Path(s) for simple vector paths

- Extract d attributes and create Konva.Path nodes per path for native vector rendering.

6.3 Rasterize with canvg (most robust across browsers)

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Image as KImage } from 'svelte-konva';
  let handle: any;
  export let src = 'https://konvajs.org/assets/tiger.svg';
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

Extensibility: an AssetFactory (optional)

```ts
// asset-factory.ts
export type AssetKind = 'image' | 'video' | 'gif' | 'sprite' | 'text' | 'svg';
export type AssetConfig =
  | { kind: 'image'; src: string; width?: number; height?: number }
  | { kind: 'video'; src: string; loop?: boolean; autoplay?: boolean; muted?: boolean }
  | { kind: 'gif'; src: string }
  | { kind: 'sprite'; sheetUrl: string; animations: Record<string, number[]>; animation: string; frameRate?: number }
  | { kind: 'text'; text: string; fontFamily?: string; fontSize?: number; fill?: string }
  | { kind: 'svg'; src: string; mode?: 'native' | 'canvg' | 'path' };
```

CSS tips
- Give canvas container a predictable size and scale Stage responsively.
- Use a separate layer for transient guides/overlays.
- Prefer CSS for layout; reserve canvas for rendering visuals only.

References (Konva docs)
- Sprite tutorial: Konva docs “Sprite”
- GIF on Canvas demo (gifler)
- SVG on Canvas demo (Konva.Image / canvg / Path)

End.