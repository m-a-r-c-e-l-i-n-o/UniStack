#!/usr/bin/env node
var UniStackCLI = require('../dist/cli.js').default
var unistackCLI = new UniStackCLI()

unistackCLI.start().then(process.exit)
