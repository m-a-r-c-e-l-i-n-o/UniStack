#!/usr/bin/env node
(new (require('../dist/cli.js').default)).start().then(process.exit)
