# Konva UX — Practical Patterns and Notes (Svelte + Konva)

Sources:
- Local wrapper overview: docs/svelte-konva-docs.md
- Konva official docs via MCP: Stage Preview (clone or image), Editable Text, Overview

Conventions:
- Use svelte-konva components and bind:handle to access underlying nodes.
- Prefer Konva.Animation for frame loops tied to layers; batchDraw when updating frequently.
- Use listening: false for preview/overlay shapes that shouldn't capture events.

Stage Preview

Two proven strategies to show a mini-map/preview of a large stage:

1) Clone Layer or Stage (live, structural)
- Create a second Stage at reduced scale (e.g., 0.25).
- Clone the main Layer: const previewLayer = layer.clone({ listening: false }).
- Ensure all shapes have stable name or id so you can sync by selector.
- On dragmove/dragend/new shape, update cloned nodes' positions from originals.
- Strip heavy styles (strokes, shadows, text) on the preview to keep it fast.

2) Image Snapshot (fastest for static updates)
- Use stage.toDataURL({ pixelRatio: scale }) to render a downscaled preview.
- Update on dragend or after debounced edits to avoid heavy re-renders per frame.

Tips
- Keep preview listening disabled to avoid duplicate hit graphs.
- For very large scenes, generate preview directly from app state instead of cloning runtime nodes.

UI Animations

Options
- Konva.Animation: attach to a Layer for continuous redraws; ideal for video/image sources or custom animations.
- Konva.Tween: interpolate node attributes over time for micro-interactions.
- CSS/DOM overlays: for tooltips or HUDs, animate with CSS outside the canvas.

Practices
- Start/stop animation loops when visible; avoid running when tab hidden.
- Cache static nodes (node.cache()) to speed up animated transforms/filters.
- Use layer.batchDraw() inside dragmove/transform for smoother updates.

Canvas Navigation (Panning, Zooming, Selection, Gestures)

Panning
- Toggle stage.draggable(true) when in "hand" mode.
- Alternative: implement spacebar-to-pan by temporarily enabling stage dragging.

Zooming (wheel to zoom into cursor)
- Handle 'wheel' on Stage, preventDefault.
- Compute pointer focal point; adjust stage scale and position so pointer stays fixed.

Pinch Zoom (touch)
- Track two touch points; compute distance delta to set scale.
- Use stage.getPointerPosition() and stage.position() math similar to wheel zoom.

Selection Rectangle (marquee)
- On mousedown, start a translucent Rect on an overlay layer; on mousemove, resize; on mouseup, select intersecting nodes via stage.find with getClientRect overlap.
- Deselect on empty-area click.

Single Selection + Transformer
- Click a node to select; attach Transformer to selected node(s).
- Click on empty stage to clear selection.
- Keep selection/transformer on a dedicated UI layer above content.

Gestures and Drag Constraints
- Use dragBoundFunc for snap-to-grid or bounds.
- For multi-select drag, group nodes temporarily or move them together on drag events.

Accessibility and UX Aids

Tooltips
- Use DOM overlays positioned at node.absolutePosition() for screen-reader-friendly tooltips.
- Alternatively use Konva.Label + Tag + Text for canvas-only hints.

Highlighting Canvas Elements
- On pointerover/out, adjust stroke or shadow for hover; cache nodes for performance.
- Keep a "hover" layer for guide/hover visuals and clear it frequently.

Context Menus for Assets
- Listen for 'contextmenu' (right-click) on Stage or node; preventDefault and show a DOM menu at client coordinates.
- Menu actions mutate node properties via bound handles.

Scale Image to Fit / Responsive Canvas
- Compute fit ratio: ratio = Math.min(containerW / contentW, containerH / contentH).
- Apply Stage scale to fit into container; set Stage size to container dimensions.
- On resize, recompute and reapply; keep a consistent "virtual" coordinate system for content.

Modify Line Points with Anchors
- For Konva.Line with points, draw draggable Circle anchors at each point; on anchor drag, update line.points([...]).
- Use Transformer only for overall line transform; anchors handle per-vertex edits.

Rich HTML on Canvas
- Prefer DOM overlays for rich content (forms, long text). Sync their position to nodes.
- If rasterization is required, render HTML/SVG to an offscreen canvas (e.g., canvg) and use as Konva.Image source.

SVG Images on Canvas
- For simple SVGs, Konva.Image.fromURL works; for complex SVG, rasterize with canvg then set the resulting canvas to an Image node.

Transparency and Blending
- Use node.opacity and fillAlpha/strokeAlpha.
- For special effects, use globalCompositeOperation modes on nodes or layers.

Data, Events, Selectors, Performance

Selectors
- Assign name or id to nodes; use stage.find('.class') or stage.findOne('#id') to query.
- Organize layers by concern: content, guides/hover, transformer/controls.

Events
- svelte-konva maps Konva events to Svelte on:event; all Konva events are supported.
- Prefer pointer events (pointerdown/enter/leave) for unified mouse/touch.
- Stop propagation when handling UI overlays to avoid unwanted selection.

Performance
- Disable hit graph where not needed: layer.listening(false) or node.listening(false).
- For massive scenes, turn off perfectDrawEnabled on shapes where anti-aliased edges aren’t critical.
- Batch updates and use layer.batchDraw(). Debounce expensive computations during drag.
- Cache complex shapes (node.cache()); remember to invalidate cache on attribute changes.
- Keep preview and HUD layers thin and static; avoid filters during live interaction.

svelte-konva-specific Notes
- Bind handles to access underlying Konva nodes; use onMount + tick to ensure handle is defined.
- Binding config enables auto-sync after dragend/transformend; pass staticConfig to turn off sync if you manage state yourself.
- For SSR/SvelteKit, import canvas features only on client: dynamic import stage or use vite-plugin-iso-import ?client.

Cross-references in this repo
- Snapping patterns: frontend/konva-notes/snapping.md
- Transformer patterns: frontend/konva-notes/transforms.md
- Asset patterns (Image/SVG/Video/GIF/Sprite/Text): frontend/konva-notes/assets.md

Checklists

Selection UX
- Click selects; empty click deselects; marquee selects multiple.
- Transformer attaches to selection; provide rotation snaps and ratio locks.
- Hover outlines and tooltips for discoverability.

Navigation UX
- Spacebar pans; wheel zooms into pointer; pinch zoom on touch.
- Show current zoom level and reset-to-fit control.

Accessibility UX
- DOM-based tooltips/menus; sufficient contrast on hover highlights.
- Keyboard shortcuts for pan/zoom reset and selection toggle.