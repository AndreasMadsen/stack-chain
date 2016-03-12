'use strict';
require('stack-chain');

var an = function () {}
an.toString = an.toString // originally not an, but still a cause of failure
Object.setPrototypeOf(an, {});

var self = Object.create(an);
Error.captureStackTrace(self);
self.stack;
