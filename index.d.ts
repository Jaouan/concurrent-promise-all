/**
 * Promise function.
 * @returns A promise.
 */
type PromiseFn = { (): Promise<unknown> };

/**
 * Promise function skipped result that occured when failing fast.
 */
interface PromiseFunctionSkippedResult {
  status: "skipped";
  promiseFunction: PromiseFn;
}

/**
 * Concurrent promise options to configure concurrency and behavior.
 */
export interface ConcurrentPromiseOptions {
  /**
   * Concurrency limit. Default 1.
   */
  maxConcurrent: number;

  /**
   * Reject after first promise reject. Default false.
   */
  failFast: boolean;
}

/**
 * Creates a Promise that is resolved with an array of results when all
 * of the provided Promises resolve or reject, using rate limiting.
 * @param values An array of Promises functions (not directly promises).
 * @param options Options (by default: 1 concurrent, no failfast).
 * @returns A new Promise.
 */
export function concurrentPromiseAllSettled<T extends readonly unknown[] | []>(
  values: PromiseFn[],
  options?: ConcurrentPromiseOptions
): Promise<{
  -readonly [P in keyof T]:
    | PromiseSettledResult<Awaited<T[P]>>
    | PromiseFunctionSkippedResult;
}>;

/**
 * Creates a Promise that is resolved with an array of results when all of the provided Promises
 * resolve, or rejected when any Promise is rejected, using rate limiting.
 * @param values An array of Promises.
 * @param options Options (by default: 1 concurrent, no failfast).
 * @returns A new Promise.
 */
export function concurrentPromiseAll<T extends readonly unknown[] | []>(
  values: PromiseFn[],
  options?: ConcurrentPromiseOptions
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }>;
