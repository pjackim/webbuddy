// state-machine.ts - Smooth state transitions (loading → ready → error)
import { writable, type Readable } from 'svelte/store';
import { handleError, createErrorInfo, type ErrorInfo } from '$lib/stores/error';

export type LoadableStatus = 'idle' | 'loading' | 'ready' | 'error';

export type LoadableState<T> = {
  status: LoadableStatus;
  data?: T;
  error?: ErrorInfo | null;
  startedAt?: number;
  finishedAt?: number;
};

export type LoadOptions = {
  minLoadingMs?: number; // minimum time to show loading for smoother UX
  onSuccessDelayMs?: number; // tiny delay before flipping to ready to avoid flicker
  name?: string; // operation name for error reporting
};

export type RetryOptions = {
  attempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  jitter?: boolean;
};

export function createLoadable<T>(initialData?: T) {
  const { subscribe, update, set } = writable<LoadableState<T>>({
    status: initialData === undefined ? 'idle' : 'ready',
    data: initialData,
    error: null
  });

  const MIN_LOADING_MS_DEFAULT = 220;
  const SUCCESS_DELAY_MS_DEFAULT = 60;

  function reset(data?: T) {
    set({ status: data === undefined ? 'idle' : 'ready', data, error: null });
  }

  function setData(data: T) {
    update((s) => ({ ...s, status: 'ready', data, error: null, finishedAt: Date.now() }));
  }

  function setError(error: ErrorInfo) {
    handleError(error);
    update((s) => ({ ...s, status: 'error', error, finishedAt: Date.now() }));
  }

  async function load(run: () => Promise<T>, options: LoadOptions = {}) {
    const minLoadingMs = options.minLoadingMs ?? MIN_LOADING_MS_DEFAULT;
    const onSuccessDelayMs = options.onSuccessDelayMs ?? SUCCESS_DELAY_MS_DEFAULT;

    const start = Date.now();
    set({ status: 'loading', startedAt: start, error: null });

    try {
      const result = await run();
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minLoadingMs - elapsed);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      if (onSuccessDelayMs > 0) await new Promise((r) => setTimeout(r, onSuccessDelayMs));
      set({ status: 'ready', data: result, error: null, startedAt: start, finishedAt: Date.now() });
      return result;
    } catch (err: any) {
      const errorInfo = createErrorInfo('LIVE', err instanceof Error ? err : String(err), options.name);
      setError(errorInfo);
      throw err;
    }
  }

  async function loadWithRetry(
    run: () => Promise<T>,
    options: LoadOptions = {},
    retryOptions: RetryOptions = {}
  ) {
    const {
      attempts = 3,
      initialDelayMs = 250,
      maxDelayMs = 2000,
      backoffFactor = 2,
      jitter = true
    } = retryOptions;

    let attempt = 0;
    let delay = initialDelayMs;

    while (true) {
      try {
        return await load(run, options);
      } catch (err) {
        attempt += 1;
        if (attempt >= attempts) throw err;
        const sleep = jitter ? jitterDelay(delay) : delay;
        await new Promise((r) => setTimeout(r, Math.min(sleep, maxDelayMs)));
        delay = Math.min(delay * backoffFactor, maxDelayMs);
      }
    }
  }

  function jitterDelay(ms: number) {
    const spread = Math.min(200, ms * 0.3);
    return ms + (Math.random() * 2 - 1) * spread;
  }

  return {
    subscribe: subscribe as Readable<LoadableState<T>>['subscribe'],
    reset,
    setData,
    setError,
    load,
    loadWithRetry
  };
}
