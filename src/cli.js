'use strict'
import Path from 'path'
import Argv from 'argv'
import Inquirer from 'inquirer'
import TreeKill from 'tree-kill'
import ChildProcess from 'child_process'
import IPC from 'ipc-event-emitter'
import Config from '../config.js'
import State from './cli-state.js'
import Transport from './transport/index.js'

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
            .then(() => this.initTransports())
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
            coreProcessIPC.on('message', message => {
                if (message.type === 'success' && message.action === 'CORE_READY') {
                    return onReady()
                }
                this.handleStatus(message)
            })
        })
    }
    initTransports() {
        const state = this.getState()
        const transport = this.getTransport()
        state.transport.message = transport('message')
    }
    getTransport() {
        return Transport.create
    }
    validateCommand(value) {
        if (value.trim()) {
            return true
        }
        const Message = this.getState().transport.message
        return Message('error', 'EMPTY_COMMAND').text
    }
    handleCoreProcessExitStatus(exitCode) {
        const Message = this.getState().transport.message
        let status
        switch (exitCode) {
            case 0:
                status = Message('success', 'UNKNOWN_CORE_EXIT').text
                break
            case 100:
                status = Message('success', 'CORE_EXIT').text
                break
            case 1:
                status = Message('error', 'UNKNOWN_CORE_EXIT').text
                break
            case 101:
                status = Message('error', 'CORE_EXIT').text
                break
            default:
                status = Message('error', 'UNKNOWN_CORE_EXIT_CODE').text
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
        const Message = this.getState().transport.message
        const questions = [{
            type: 'input',
            name: 'command',
            message: Message('update', 'PROMPT_FOR_COMMAND').text
        }]
        const prompt = Inquirer.createPromptModule()
        const promise = prompt(questions)
        promise.then(answers => {
            return answers
        })
        return promise
    }
    statusNotFound(status) {
        console.error('Unknown status from core:', status.type, status.action)
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
