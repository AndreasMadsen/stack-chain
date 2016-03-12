'use strict';

//
// Must
//
function Must(actual) {
  this.actual = actual
}

Object.defineProperty(Must.prototype, "an", { get: function() {
  var assert = this.object.bind(this)
  assert.toString = this.object.toString
  Object.setPrototypeOf(assert, this)
  return assert
}});

Must.prototype.object = function() {
  this.stack;
}

Must.prototype.reject = function () {
  var must = Object.create(this)
  var objectFn = must.object;

  must.object = function cut() {
    var self = Object.create(this)
    Error.captureStackTrace(self, cut)
    return this.actual.catch(objectFn.bind(self))
  }

  return must
}

//
// Test
//
require('stack-chain');
new Must(
  Promise.reject({})
).reject().an.object().catch(function (error) {
  console.error(error.stack)
})
