# concurrent-promise-all

> Resolve several promises using concurrency limit and failfast.

## Install

```
$ yarn add concurrent-promise-all
```

## Usage

```js
import { concurrentPromiseAllSettled } from "concurrent-promise-all";

const result = await concurrentPromiseAllSettled(
  [
    () => axios("http://my-api"),
    () => axios("http://my-api"),
    () => axios("http://my-api"),
  ],
  { maxConcurrent: 2 }
);
console.log(result);
```
```js
[
  { status: 'fulfilled', value: { /* axios response */ } },
  { status: 'fulfilled', value: { /* axios response */ } },
  { status: 'fulfilled', value: { /* axios response */ } },
]
```

It also works if you don't put "promise function" in the array. BUT rate limiting won't work if concurrent-promise-all can't trigger promise itself.

```js
concurrentPromiseAllSettled(
  [
    () => axios("http://my-api"),
    axios("http://my-api"),
    "foo"
  ],
  { maxConcurrent: 2 }
)
```
```js
[
  { status: 'fulfilled', value: { /* axios response */ } },
  { status: 'fulfilled', value: { /* axios response */ } },
  { status: 'fulfilled', value: "foo" },
]
```

Example on promise reject.

```js
concurrentPromiseAllSettled(
  [
    () => axios("http://my-api-that-crashes"),
    () => {
      throw "oops no promise and error";
    },
    async () => {
      throw "oops error in promise";
    },
    () => axios("http://my-api-that-works"),
  ],
  { maxConcurrent: 3 }
)
```
```js
[
  { status: 'rejected', reason: { /* error */ } },
  { status: 'rejected', reason: { /* error */ } },
  { status: 'rejected', reason: { /* error */ } },
  { status: 'fulfilled', value: { /* axios response */ } },
]
```


And **fail fast**, after first promise reject. Keep it mind that you can have as many `rejected` as `maxConcurrent`, since promise are executed "simultaneously".

```js
concurrentPromiseAllSettled(
  [
    () => axios("http://my-api-that-crashes"),
    () => {
      throw "oops no promise and error";
    },
    async () => {
      throw "oops error in promise";
    },
    () => axios("http://my-api-that-works"),
  ],
  { maxConcurrent: 2 }
).then(console.log, console.error);
```
```js
[
  { status: 'rejected', reason: { /* error */ } },
  { status: 'rejected', reason: { /* error */ } },
  { status: 'skipped', promiseFunction: { /* not executed promise function */ } },
  { status: 'skipped', promiseFunction: { /* not executed promise function */ } },
]
```



