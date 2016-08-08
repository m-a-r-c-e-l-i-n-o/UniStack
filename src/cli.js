'use strict'
import Path from 'path'
import Argv from 'argv'
import Inquirer from 'inquirer'
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
    init() {
        return new Promise((resolve, reject) => {
            this.initCoreProcess().then(({ coreProcess }) => {
                coreProcess.on('exit', exitCode => {
                    this.handleCoreProcessExitStatus(exitCode)
                    resolve(exitCode)
                })
            })
        })
    }
    initCoreProcess() {
        const state = this.getState()
        const system = this.getSystemConstants()
        const instanceFile = Path.join(system.root, 'bin', 'core-instance.js')
        const cwd = system.environment.root

        return new Promise((resolve, reject) => {
            const coreProcess = ChildProcess.fork(instanceFile, [], { cwd })
            const coreProcessIPC = IPC(coreProcess)
            const onReady = ((coreProcess, coreProcessIPC, resolve) => () => {
                const processWrapper = {
                    instance: coreProcess,
                    destroy: callback => {
                        coreProcess.disconnect()
                        TreeKill(coreProcess.pid, 'SIGKILL', callback)
                    },
                    validate: this.validateCommand.bind(this)
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
    validateCommand(value) {
        if (value.trim()) {
            return true
        }
        return Config.message.instruction.EMPTY_COMMAND
    }
    handleCoreProcessExitStatus(exitCode) {
        let status
        switch (exitCode) {
            case 0:
                status = { type: 'success', data: { message: 'UNKNOWN_CORE_EXIT' }}
                break
            case 100:
                status = { type: 'success', data: { message: 'CORE_EXIT' }}
                break
            case 1:
                status = { type: 'error', data: { message: 'UNKNOWN_CORE_EXIT' }}
                break
            case 101:
                status = { type: 'error', data: { message: 'CORE_EXIT' }}
                break
            default:
                status = { type: 'error', data: { message: 'UNKNOWN_CORE_EXIT_CODE' }}
        }
        this.handleStatus(status)
        return status
    }
    handleStatus(status) {
        switch(status.type) {
            default:
                this.statusNotFound(status)
        }
    }
    promptForCommand() {
        const questions = [{
            type: 'input',
            name: 'command',
            message: Config.message.instruction.PROMPT_FOR_COMMAND
        }]
        const prompt = Inquirer.createPromptModule()
        const promise = prompt(questions)
        promise.then(answers => {
            return answers
        })
        return promise
    }
    statusNotFound(status) {
        console.error('Unknown status from core:', status.type, status.data)
    }
    throwError(error) {
        throw error
    }
    throwAsyncError(error) {
        setTimeout(() => this.throwError(error), 0)
        return false
    }
    handleError(error, options = {}) {
        if (typeof error === 'string') {
            error = new Error(error)
        }
        if (!options.warning) {
            const hook = options.hook
            if (typeof hook === 'function' && hook(error) === false) {
                return
            }
            this.throwError(error)
        }
        console.warn(error.message);
    }
}

export default UniStackCLI
