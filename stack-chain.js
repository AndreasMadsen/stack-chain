/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

// use a already existing formater or fallback to the default v8 formater
var defaultFormater = Error.prepareStackTrace || require('./format.js');

// public define API
function stackChain() {
  this.extend = new TraceModifier();
  this.filter = new TraceModifier();
  this.format = new StackFormater();
}

var chain = module.exports = new stackChain();

function TraceModifier() {
  this._modifiers = [];
}

TraceModifier.prototype._modify = function (error, frames) {
  for (var i = 0, l = this._modifiers.length; i < l; i++) {
    frames = this._modifiers[i](error, frames);
  }

  return frames;
};

TraceModifier.prototype.attach = function (modifier) {
  this._modifiers.push(modifier);
};

TraceModifier.prototype.deattach = function (modifier) {
  var index = this._modifiers.indexOf(modifier);

  if (index === -1) return false;

  this._modifiers.splice(index, 1);
  return true;
};

function StackFormater() {
  this._formater = defaultFormater;
}

StackFormater.prototype.replace = function (formater) {
  this._formater = formater;
};

StackFormater.prototype.restore  = function () {
  this._formater = defaultFormater;
};

// Replace the v8 stack trace creator
Error.prepareStackTrace = function (error, frames) {
  // Store v8 call site object
  error.callSite = frames;

  // extend frames
  frames = chain.extend._modify(error, frames);

  // filter frames
  frames = chain.filter._modify(error, frames);

  // reduce frames to match Error.stackTraceLimit
  frames = frames.slice(0, Error.stackTraceLimit);

  // format frames
  return chain.format._formater(error, frames);
};

// Manage call site storeage
Object.defineProperty(Error.prototype, 'callSite', {
  'get': function () {
    // return callSite if it already exist
    if (this._callSite) {
      return this._callSite;
    }

    // calculate call site object
    var stack = this.stack;

    // return call site object
    return this._callSite;
  },

  'set': function (callSite) {
    // set a hidden writable ._callSite property
    Object.defineProperty(this, '_callSite', {
      value: callSite,
      configurable: true
    });
  },

  configurable: true
});
