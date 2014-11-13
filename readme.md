# ondone

Wait for one or more async functions to be done.

## Installation

```js
npm install --save ondone
```

## API

```js
var ondone = require('ondone');
tasks = ondone(tasks, doneFn);
// or
tasks = ondone(function(done) {}, ..., doneFn);
```

`ondone` accepts an array of `tasks` and a done function (`doneFn`). It returns an array of functions that can be passed to any async execution engine (like `miniq` or `async.js`). It adds the following functionality:

- once all of the tasks have completed, the done function is called (with no error or result argument)
- if any of the tasks returns an error:
    - the done function is called with the error
    - the other tasks passed in the same array will be cancelled (will become no-ops)
- if the done function to any callback is called twice, an error is thrown

In short, this is "waiting for tasks to complete" portion of async execution without the actual task execution logic. It helps keep async runners smaller (ondone is ~1000 bytes unminified) while allowing them to support more flexible task batching.

Tasks are callbacks that have a signature such as:

- `function(done) {}`
- `function(arg1, done) {}`
- `function(arg1, arg2, ..., done)`

that is, the last argument to each task must be a `done` function. The `done` function should accept an `err` (error) parameter as it's first argument, and may have additional arguments after the `err` argument, e.g.:

- `function done(err) {}`
- `function done(err, arg) {}`
- `function done(err, arg1, arg2, ...) {}`
