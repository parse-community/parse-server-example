/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

import ParsePromise from './ParsePromise';

class TaskQueue {

  constructor() {
    this.queue = [];
  }

  enqueue(task) {
    var taskComplete = new ParsePromise();
    this.queue.push({
      task: task,
      _completion: taskComplete
    });
    if (this.queue.length === 1) {
      task().then(() => {
        this._dequeue();
        taskComplete.resolve();
      }, error => {
        this._dequeue();
        taskComplete.reject(error);
      });
    }
    return taskComplete;
  }

  _dequeue() {
    this.queue.shift();
    if (this.queue.length) {
      var next = this.queue[0];
      next.task().then(() => {
        this._dequeue();
        next._completion.resolve();
      }, error => {
        this._dequeue();
        next._completion.reject(error);
      });
    }
  }
}

module.exports = TaskQueue;