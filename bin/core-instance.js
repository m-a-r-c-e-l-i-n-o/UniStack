#!/usr/bin/env node
var unistack = new (require('../dist/core.js').default)
unistack.listenToCLI().then(process.exit).catch(e => console.log(e.stack))
