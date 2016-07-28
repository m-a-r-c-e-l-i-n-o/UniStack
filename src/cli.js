'use strict'
import Fs from 'fs-extra'
import Path from 'path'
import Argv from 'argv'
import Config from '../config.js'

const UniStack = {
    constructor(processArgs) {
        this.instance = new UniStack
        this.registerCommands()
        this.listenToEvents()
        return this.instance.startDevEnvironment()
        // draw input box
        // parse input with Argv
    },
    listenToEvents() {
        const host = 'http://localhost:' + Config.server.reloaderPort
        const clientSocket = IOClient.connect(host, {
            'reconnection delay' : 0,
            'reopen delay' : 0,
            'force new connection' : true
        })
        clientSocket.on('reload', this.handleBrowserReload.bind(this))
        clientSocket.on('change', this.handleFileChange.bind(this))
    },
    registerCommands() {
        Argv.mod({
            mod: 'install',
            description: 'Install a jspm, npm, or github package.',
            options:  [{
                name: 'save',
                short: 'S',
                type: 'boolean',
                description: 'Bla bla bla',
                example: "'unistack --save'"
            }, {
                name: 'save-dev',
                short: 'D',
                type: 'boolean',
                description: 'Bla bla bla',
                example: "'unistack --save-dev'"
            }]
        })
    },
    capitalize(string) {
        return (string[0].toUpperCase()) + string.substr(1).toLowerCase()
    },
    handleFileChange() {

    },
    handleInput(commandString) {
        const command = Argv.run(commandString.split(/\s+/))
        const target = this.capitalize(command.targets[0])
        const method = this[`handle${target}Command`]
        if (!method) {
            return console.error(`Command "${target}" not found!`)
        }
        method.call(this, command.options)
    },
    handleStopCommand() {
        this.instance.stopDevEnvironment()
    },
    getInitialState() {
        return Object.seal({})
    },
    getSystemConstant() {
    },
    parseArguments() {
    }
}

export default UniStack
