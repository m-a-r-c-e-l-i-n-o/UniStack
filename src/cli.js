'use strict'
import Path from 'path'
import Argv from 'argv'
import TreeKill from 'tree-kill'
import ChildProcess from 'child_process'
import IPC from 'ipc-event-emitter'
import Config from '../config.js'
import State from './cli-state.js'

class UniStackCLI {
    constructor() {
        this.cache = {}
    }
    getState() {
        if (typeof this.cache.state === 'object') {
            return this.cache.state
        }
        return this.cache.state = Object.seal(Object.assign({}, State))
    }
    getSystemConstants() {
        if (typeof this.cache.system === 'object') {
            return this.cache.system
        }
        const unistackPath = Path.join(__dirname, '..')
        const envPath = Config.environment.directory
        return this.cache.system = Object.freeze({
            environment: Object.freeze({
                root: envPath,
                unistack: Object.freeze({
                    root: Path.join(envPath, 'node_modules', 'unistack'),
                }),
            }),
            root: unistackPath
        })
    }
    start() {
        return this.initCoreProcess()
    }
    initCoreProcess(mockInstanceFile) {
        return new Promise((resolve, reject) => {
            const state = this.getState()
            const system = this.getSystemConstants()
            const instanceFile = Path.join(system.root, 'bin', 'core-instance.js')
            const cwd = system.environment.root
            const coreProcess = ChildProcess.fork(
                mockInstanceFile || instanceFile, [], { cwd }
            )
            const coreProcessIPC = IPC(coreProcess)
            const onReady = ((coreProcess, coreProcessIPC, resolve) => () => {
                const processWrapper = {
                    instance: coreProcess,
                    destroy: callback => {
                        coreProcess.disconnect()
                        TreeKill(coreProcess.pid, 'SIGKILL', callback)
                    }
                }
                state.processes.core = processWrapper
                state.messenger.core = coreProcessIPC
                resolve({ coreProcess: processWrapper, coreProcessIPC })
            })(coreProcess, coreProcessIPC, resolve)

            coreProcessIPC.on('core::ready', onReady)
            coreProcessIPC.on('core::status', status => {
                this.handleStatus(status)
            })
        })
    }
    handleStatus(status) {
        switch(status.type) {
            default:
                this.statusNotFound(status)
        }
    }
    statusNotFound(status) {
        console.error('Unknown status from core:', status.type, status.data)
    }
}

export default UniStackCLI
