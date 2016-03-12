'use strict';
require('stack-chain');

var expect = {
  actual: Promise.reject({}),
  object: function () {
    this.stack
  }
};

var reject = Object.create(expect)
var objectFn = reject.object;
reject.object = function cut() {
  var self = Object.create(this)
  Error.captureStackTrace(self, cut)
  return this.actual.catch(objectFn.bind(self))
};

var an = reject.object.bind(reject)
an.toString = reject.object.toString
Object.setPrototypeOf(an, reject)

var object = an.object();

object.catch(function (error) {
  console.error(error.stack)
});
