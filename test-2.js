require('stack-chain')
var expect = require('must')

expect(
  Promise.reject({})
).to.reject.to.be.an.object().catch(function (error) {
  console.error(error.stack)
})
