
//
// Thenable
//
function Thenable(must) {
  must = Object.create(must)

  for (var name in must) {
    if (typeof must[name] == "function") {
      must[name] = promisify(must[name])
    }
  }

  return must
}

function promisify(fn) {
  return function cut() {
    var self = Object.create(this)
    Error.captureStackTrace(self, cut)
    return this.actual.catch(fn.bind(self))
  }
}

//
// Must
//
function Must(actual) {
  this.actual = actual
}

Object.defineProperty(Must.prototype, "an", { get: function() {
  var assert = this.instanceof.bind(this)
  assert.toString = this.instanceof.toString
  Object.setPrototypeOf(assert, this)
  return assert
}});

Must.prototype.object = function() {
  this.stack;
}

Must.prototype.instanceof = function(expected) {
  this.stack;
}

Must.prototype.reject = function () {
  return Thenable(this);
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
