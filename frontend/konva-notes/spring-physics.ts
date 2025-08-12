// spring-physics.ts - Subtle spring utilities for snapping and movement

export type SpringOptions = {
  stiffness?: number; // spring constant
  damping?: number;   // friction-like term
  mass?: number;      // mass
  restSpeed?: number; // velocity threshold to stop
  restDelta?: number; // position threshold to stop
  maxDurationMs?: number;
};

export type Vector2 = { x: number; y: number };

const DEFAULTS: Required<SpringOptions> = {
  stiffness: 220,
  damping: 28,
  mass: 1,
  restSpeed: 0.02,
  restDelta: 0.5,
  maxDurationMs: 900
};

export function springAnimate(
  from: number,
  to: number,
  onUpdate: (value: number) => void,
  options: SpringOptions = {},
  onComplete?: () => void
) {
  const cfg = { ...DEFAULTS, ...options };
  let x = from;
  let v = 0;
  let lastTime = performance.now();
  const start = lastTime;

  let raf = 0;
  function step(now: number) {
    const dt = Math.min(64, now - lastTime) / 1000; // seconds, clamp to avoid large steps
    lastTime = now;

    const displacement = x - to;
    const springForce = -cfg.stiffness * displacement;
    const dampingForce = -cfg.damping * v;
    const acceleration = (springForce + dampingForce) / cfg.mass;

    v += acceleration * dt;
    x += v * dt;

    onUpdate(x);

    const done =
      Math.abs(v) <= cfg.restSpeed && Math.abs(to - x) <= cfg.restDelta || (now - start) > cfg.maxDurationMs;

    if (!done) {
      raf = requestAnimationFrame(step);
    } else {
      onUpdate(to);
      if (onComplete) onComplete();
    }
  }

  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export function springAnimateVec(
  from: Vector2,
  to: Vector2,
  onUpdate: (value: Vector2) => void,
  options: SpringOptions = {},
  onComplete?: () => void
) {
  let cancelX = springAnimate(from.x, to.x, (x) => onUpdate({ x, y: from.y }), options);
  let cancelY = springAnimate(from.y, to.y, (y) => onUpdate({ x: to.x, y }), options, onComplete);
  return () => { cancelX(); cancelY(); };
}

export function nearestSnap(value: number, grid: number | number[]) {
  if (Array.isArray(grid)) {
    return grid.reduce((prev, cur) => (Math.abs(cur - value) < Math.abs(prev - value) ? cur : prev), grid[0]);
  }
  return Math.round(value / grid) * grid;
}

export function springSnap(
  from: number,
  targets: number | number[],
  onUpdate: (value: number) => void,
  options: SpringOptions = {}
) {
  const to = nearestSnap(from, targets);
  return springAnimate(from, to, onUpdate, options);
}

export function springSnapVec(
  from: Vector2,
  targetsX: number | number[],
  targetsY: number | number[],
  onUpdate: (value: Vector2) => void,
  options: SpringOptions = {}
) {
  const to: Vector2 = {
    x: nearestSnap(from.x, targetsX),
    y: nearestSnap(from.y, targetsY)
  };
  return springAnimateVec(from, to, onUpdate, options);
}
