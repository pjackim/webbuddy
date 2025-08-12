// error-recovery.ts - Graceful degradation and intelligent error handling
import { handleError, createErrorInfo, handleApiError, type ErrorInfo } from '$lib/stores/error';

export type RecoveryDecision<T> = {
  shouldRetry: boolean;
  retryDelayMs?: number;
  fallbackValue?: T;
  degrade?: () => void; // turn off a feature, switch renderer, etc.
  reason?: string;
};

export type Classifier =
  | 'NETWORK'
  | 'API_4XX'
  | 'API_5XX'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'JS'
  | 'UNKNOWN';

export function classifyError(err: unknown): Classifier {
  if (err instanceof Response) {
    if (err.status >= 500) return 'API_5XX';
    if (err.status === 429) return 'RATE_LIMIT';
    if (err.status >= 400) return 'API_4XX';
  }
  if (err instanceof Error) {
    if (/timeout/i.test(err.message)) return 'TIMEOUT';
    if (/Failed to fetch|NetworkError/i.test(err.message)) return 'NETWORK';
    return 'JS';
  }
  return 'UNKNOWN';
}

export function reportError(name: string, err: unknown, context?: Record<string, unknown>): ErrorInfo {
  const message = err instanceof Error ? err : new Error(String(err));
  const details = context ? JSON.stringify(context, null, 2) : undefined;
  const info = createErrorInfo('LIVE', message, details);
  handleError(info);
  return info;
}

export async function retry<T>(fn: () => Promise<T>, attempts = 3, initialDelayMs = 300) {
  let delay = initialDelayMs;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      const sleep = delay + (Math.random() * 2 - 1) * Math.min(200, delay * 0.3);
      await new Promise((r) => setTimeout(r, Math.max(0, sleep)));
      delay = Math.min(delay * 2, 3000);
    }
  }
  // unreachable
  throw new Error('retry: unexpected');
}

export async function withRecovery<T>(
  name: string,
  fn: () => Promise<T>,
  decide: (classification: Classifier, attempt: number) => RecoveryDecision<T> = defaultDecision
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      const classification = classifyError(err);
      const decision = decide(classification, attempt);

      // Report with rich context
      reportError(name, err, { classification, attempt, decision: { ...decision, degrade: !!decision.degrade } });

      if (decision.degrade) {
        try { decision.degrade(); } catch {}
      }

      if (decision.fallbackValue !== undefined) {
        return decision.fallbackValue as T;
      }

      if (!decision.shouldRetry) throw err;
      const delay = decision.retryDelayMs ?? 300;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

function defaultDecision(classification: Classifier, attempt: number): RecoveryDecision<never> {
  switch (classification) {
    case 'NETWORK':
    case 'TIMEOUT':
      return { shouldRetry: attempt < 3, retryDelayMs: 300 * attempt };
    case 'RATE_LIMIT':
      return { shouldRetry: attempt < 4, retryDelayMs: 800 * attempt };
    case 'API_5XX':
      return { shouldRetry: attempt < 2, retryDelayMs: 500 };
    case 'API_4XX':
      return { shouldRetry: false };
    case 'JS':
    default:
      return { shouldRetry: false };
  }
}

// Detailed error context builder
export function buildErrorContext(context: Record<string, unknown>) {
  return JSON.stringify(context, null, 2);
}
