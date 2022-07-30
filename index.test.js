import { concurrentPromiseAll, concurrentPromiseAllSettled } from "./index.js";

test("concurrentPromiseAllSettled resolved.", async () => {
  expect(
    await concurrentPromiseAllSettled([() => Promise.resolve("foo")])
  ).toStrictEqual([{ status: "fulfilled", value: "foo" }]);
});

test("concurrentPromiseAllSettled resolved without promise function (bad usage resilience).", async () => {
  expect(
    await concurrentPromiseAllSettled([
      Promise.resolve("foo"),
      true,
      false,
      null,
      "bar",
    ])
  ).toStrictEqual([
    { status: "fulfilled", value: "foo" },
    { status: "fulfilled", value: true },
    { status: "fulfilled", value: false },
    { status: "fulfilled", value: null },
    { status: "fulfilled", value: "bar" },
  ]);
});

test("concurrentPromiseAllSettled rejected.", async () => {
  expect(
    await concurrentPromiseAllSettled([() => Promise.reject("foo")])
  ).toStrictEqual([{ status: "rejected", reason: "foo" }]);
});

test("concurrentPromiseAllSettled rejected with failfast.", async () => {
  const skippedPromise = Promise.resolve("foo");
  expect(
    (
      await concurrentPromiseAllSettled(
        [
          () => Promise.resolve("foo"),
          () => Promise.reject("oops"),
          () => "bar",
        ],
        { failFast: true }
      )
    ).map((result) => ({
      status: result.status,
      value: result.value,
      reason: result.reason,
    }))
  ).toStrictEqual([
    { status: "fulfilled", value: "foo", reason: undefined },
    { status: "rejected", reason: "oops", value: undefined },
    {
      status: "skipped",
      reason: undefined,
      value: undefined,
    },
  ]);
});

test("concurrentPromiseAll resolved.", async () => {
  expect(
    await concurrentPromiseAll([
      () => Promise.resolve("foo"),
      () => "bar",
      true,
      null,
    ])
  ).toStrictEqual(["foo", "bar", true, null]);
});

test("concurrentPromiseAll rejected.", () => {
  expect(
    concurrentPromiseAll([
      () => Promise.reject("foo"),
      () => Promise.reject("bar"),
      () => true,
      () => null,
    ])
  ).rejects.toStrictEqual(["foo", "bar"]);
});

test("concurrentPromiseAll rejected with failfast.", () => {
  expect(
    concurrentPromiseAll(
      [
        () => Promise.reject("foo"),
        () => Promise.reject("bar"),
        () => true,
        () => null,
      ],
      {
        failFast: true,
        maxConcurrent: 1,
      }
    )
  ).rejects.toStrictEqual(["foo"]);
});
