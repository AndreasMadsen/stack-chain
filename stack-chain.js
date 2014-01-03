
// use a already existing formater or fallback to the default v8 formater
var defaultFormater = Error.prepareStackTrace || require('./format.js');

// public define API
function stackChain() {
  this.extend = new TraceModifier();
  this.filter = new TraceModifier();
  this.format = new StackFormater();
  this.version = require('./package.json').version;
}

var chain = new stackChain();

// If a another copy (same version or not) of stack-chain exists it will result
// in wrong stack traces (most likely dublicate callSites).
if (global._stackChain) {
  // In case the version match, we can simply return the first initialized copy
  if (global._stackChain.version === chain.version) {
    console.error('Another copy of stack-chain was found, using the first initialized copy');
    module.exports = global._stackChain;

    return; // Prevents V8 and Error extentions from being set again
  }
  // The version don't match, this is really bad. Lets just throw
  else {
    throw new Error('Conflicting version of stack-chain found');
  }
}
// Yay, no other stack-chain copy exists, yet :/
else {
  module.exports = global._stackChain = chain;
}

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
    this.stack;

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
