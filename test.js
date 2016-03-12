'use strict';
require('stack-chain');

var reject = {
  objectWrap: function cut() {
    var self = Object.create(this);
    Error.captureStackTrace(self, cut);
    return Promise.reject({}).catch(function () {
      self.stack;
    });
  }
};

var an = reject.objectWrap.bind(reject)
an.toString = reject.objectWrap.toString
Object.setPrototypeOf(an, reject)

var object = an.objectWrap();

object.catch(function (error) {
  console.error(error.stack)
});
