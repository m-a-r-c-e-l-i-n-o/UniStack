#!/usr/bin/env node
var UniStack = require('../dist/core.js').default
var unistack = new UniStack()

unistack.listenToCLI().then(process.exit).catch(e => console.log(e.stack))
