// animations.ts - Delightful, purposeful animations (DOM + Konva helpers)

type Cancel = () => void;

export function microPress(node: HTMLElement): Cancel {
  const anim = node.animate(
    [
      { transform: 'scale(1)', offset: 0 },
      { transform: 'scale(0.985)', offset: 0.35 },
      { transform: 'scale(1)', offset: 1 }
    ],
    { duration: 130, easing: 'cubic-bezier(.2,.8,.2,1)' }
  );
  return () => anim.cancel();
}

export function pulseHighlight(node: HTMLElement, color?: string): Cancel {
  const highlight = color || getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
  const anim = node.animate(
    [
      { boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
      { boxShadow: `0 0 0 6px ${withAlpha(highlight, 0.12)}` },
      { boxShadow: '0 0 0 0 rgba(0,0,0,0)' }
    ],
    { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' }
  );
  return () => anim.cancel();
}

export function subtleShake(node: HTMLElement): Cancel {
  const anim = node.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-2px)' },
      { transform: 'translateX(2px)' },
      { transform: 'translateX(0)' }
    ],
    { duration: 200, easing: 'ease-in-out' }
  );
  return () => anim.cancel();
}

function withAlpha(color: string, alpha: number) {
  // simple: if color is oklch(), append / alpha
  if (/oklch\(/i.test(color)) return color.replace(/\)$/, ` / ${alpha})`);
  if (/^#/.test(color)) return hexToRgba(color, alpha);
  return color;
}

function hexToRgba(hex: string, alpha: number) {
  const m = hex.replace('#', '');
  const bigint = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Konva helpers, if Konva nodes are available at runtime
export type KonvaNodeLike = { to?: (config: Record<string, any>) => void; };

export function konvaPulse(node: KonvaNodeLike) {
  if (!node?.to) return () => {};
  node.to?.({ scaleX: 1.03, scaleY: 1.03, duration: 0.08, easing: (window as any).Konva?.Easings?.EaseOut || undefined });
  node.to?.({ scaleX: 1.0, scaleY: 1.0, duration: 0.12, easing: (window as any).Konva?.Easings?.EaseInOut || undefined });
  return () => {};
}
