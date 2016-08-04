#!/usr/bin/env node
var Config = require('../config.js').default
var UniStackCLI = require('../dist/cli.js').default
var unistackCLI = new UniStackCLI()

unistackCLI
.start()
.then(process.exit)
.catch(e => {
    var errorMessage = Config.message.error.EXIT
    var formattedMessage = errorMessage.replace('{{error_stack}}', e.stack || e)
    console.error(formattedMessage)
})
