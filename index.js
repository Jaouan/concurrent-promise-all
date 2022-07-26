const failStrategies = {
  failFast: (results, queue) => {
    results.push(
      ...queue.map((promiseFunction) => ({
        status: "skipped",
        promiseFunction,
      }))
    );
    queue.length = 0;
  },
  failSlow: () => {},
};

const ensurePromise = (maybePromise) =>
  maybePromise?.then ? maybePromise : Promise.resolve(maybePromise);

const ensureFunction = (maybeFunction) =>
  typeof maybeFunction === "function" ? maybeFunction : () => maybeFunction;

const wrapCatch = (fn) => {
  try {
    return fn();
  } catch (e) {
    return Promise.reject(e);
  }
};

const queuedPromiseAllSettled = (promisesFn, maxConcurrent, failStrategy) =>
  new Promise(async (resolve) => {
    const queue = [...promisesFn];
    const results = [];
    const handleSettle = (promise) => {
      ensurePromise(promise)
        .then(
          (result) =>
            results.push({
              status: "fulfilled",
              value: result,
            }),
          (e) => {
            results.push({
              status: "rejected",
              reason: e,
            });
            failStrategy(results, queue);
          }
        )
        .finally(() =>
          results.length === promisesFn.length
            ? resolve(results)
            : queue.length && handleSettle(wrapCatch(queue.shift()))
        );
    };
    const maxConcurrentPromise = queue.splice(0, maxConcurrent);
    maxConcurrentPromise.forEach((promise) => handleSettle(wrapCatch(promise)));
  });

export const concurrentPromiseAllSettled = (
  promises = [],
  { maxConcurrent = 1, failFast = false }
) =>
  queuedPromiseAllSettled(
    promises.map(ensureFunction),
    maxConcurrent,
    failFast ? failStrategies.failFast : failStrategies.failSlow
  );
