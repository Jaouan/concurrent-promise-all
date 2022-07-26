import { concurrentPromiseAllSettled } from "./index.js";

const timeoutResolve = (message) => () =>
  new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(message);
    }, 100);
  });

const timeoutReject = (message) => () =>
  new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(message);
    }, 1000);
  });

concurrentPromiseAllSettled(
  [
    timeoutResolve("foo"),
    timeoutResolve("bar"),
    timeoutReject("first crash but delayed"),
    "oops a string without function",
    () => "oops no promise",
    () => {
      throw "oops no promise and error";
    },
    async () => {
      throw "oops error in promise";
    },
    null,
    undefined,
    false,
    true,
  ],
  { maxConcurrent: 2, failFast: true }
)
  .then(console.log, console.error)
  .catch(console.error);
