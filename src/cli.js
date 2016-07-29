'use strict'
import Argv from 'argv'
import IOClient from 'socket.io-client'
import Config from '../config.js'
import State from './cli-state.js'

class UniStackCLI {
    constructor() {
        this.cache = {}
    }
    start() {
        return this.listenToEvents()
    }
    getState() {
        if (typeof this.cache.state === 'object') {
            return this.cache.state
        }
        return this.cache.state = Object.seal(Object.assign({}, State))
    }
    listenToEvents() {
        return new Promise((resolve, reject) => {
            const state = this.getState()
            const host = 'http://localhost:' + Config.server.reloaderPort
            const message = IOClient.connect(host, {
                'reconnection delay' : 0,
                'reopen delay' : 0,
                'force new connection' : true
            })
            message.on('connect', () => {
                state.message.io = message.io
                state.message.server = message
                resolve(message)
            })
        })
    }
}

export default UniStackCLI
