import Fs from 'fs-extra'
import Path from 'path'
import UniStackCLI from '../../src/cli.js'
import State from '../../src/cli-state.js'
import Config from '../../config.js'

const unistackPath = Path.join(__dirname, '..', '..')
const unistackTmpPath = Path.join(unistackPath, 'tmp')
const unistackEnvPath = Path.join(unistackPath, 'environment')
const envPath = Config.environment.directory
const testPath = Path.join(unistackPath, 'test')
const envUnistackPath = Path.join(envPath, 'node_modules', 'unistack')
const envUnistackBootstrapPath = Path.join(envUnistackPath, 'bootstrap')

describe ('UniStackCLI', () => {
    it ('should be a function.', () => {
        expect(typeof UniStackCLI).toBe('function')
    })
})

describe ('UniStackCLI constructor()', () => {
    it ('should instantiate a cache object', () => {
        const unistack = new UniStackCLI()
        expect(typeof unistack.cache).toBe('object')
    })
})

describe ('UniStackCLI getState()', () => {
    it ('should return a state object', () => {
        const unistack = new UniStackCLI()
        expect(unistack.getState()).toEqual(State)
    })
    it ('should return a non-extendable object', () => {
        const unistack = new UniStackCLI()
        const state = unistack.getState()
        expect(() => state.hello = 'world')
        .toThrowError('Can\'t add property hello, object is not extensible')
    })
    it ('should cache state object', () => {
        const unistack = new UniStackCLI()
        const state = unistack.getState()
        expect(unistack.getState()).toBe(state)
    })
})

describe ('UniStackCLI getSystemConstants()', () => {
    it ('should return a root property with unistack\'s root path', () => {
        const unistack = new UniStackCLI()
        const system = unistack.getSystemConstants()
        expect(system.root).toBe(unistackPath)
    })
    it ('should return an property with the environment\'s root path', () => {
        const unistack = new UniStackCLI()
        const system = unistack.getSystemConstants()
        expect(system.environment.root).toBe(envPath)
    })
    it ('should return an property with the environment\'s unistack root path', () => {
        const unistack = new UniStackCLI()
        const system = unistack.getSystemConstants()
        expect(system.environment.unistack.root).toBe(envUnistackPath)
    })
    it ('should cache system object', () => {
        const unistack = new UniStackCLI()
        const system = unistack.getSystemConstants()
        expect(unistack.getSystemConstants()).toBe(system)
    })
})

describe ('UniStackCLI start()', () => {
    it ('should initiate connection with core', (done) => {
        const unistack = new UniStackCLI
        unistack.initCoreProcess = () => Promise.resolve()
        spyOn(unistack, 'initCoreProcess').and.callThrough()
        unistack.start().then(done)
        .catch(e => console.error(e.stack))
        expect(unistack.initCoreProcess).toHaveBeenCalledTimes(1)
    })
})

describe ('UniStackCLI initCoreProcess()', () => {
    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should start message server', (done) => {
        const unistack = new UniStackCLI
        unistack.initCoreProcess().then(({ coreProcess }) => {
            coreProcess.destroy(done)
        })
        .catch(e => console.error(e.stack))
    })
    it ('should store the core process and ipc in the state object', (done) => {
        const unistack = new UniStackCLI()
        unistack.initCoreProcess().then(({ coreProcess, coreProcessIPC }) => {
            expect(unistack.cache.state.processes.core).toBe(coreProcess)
            expect(unistack.cache.state.messenger.core).toBe(coreProcessIPC)
            coreProcess.destroy(done)
        })
        .catch(e => console.error(e.stack))
    })
    it ('should handle status updates from the core', (done) => {
        const unistack = new UniStackCLI
        const mockCoreInstancePath = Path.join(unistackTmpPath, 'core-instance.js')
        const content = `
            #!/usr/bin/env node
            var IPC = require('ipc-event-emitter').default
            var ipc = IPC(process)
            ipc.fix('core::ready')
            ipc.emit('core::status', {
                type: 'something_other_than_ready',
                data: 'nothing'
            })
        `
        Fs.writeFileSync(mockCoreInstancePath, content.trim())
        Fs.chmodSync(mockCoreInstancePath, '0755')
        let globalCoreProcess
        unistack.handleStatus = (status) => {
            expect(status.type).toBe('something_other_than_ready')
            expect(status.data).toBe('nothing')
            expect(unistack.handleStatus).toHaveBeenCalledTimes(1)
            Fs.removeSync(mockCoreInstancePath)
            globalCoreProcess.destroy(done)
        }
        spyOn(unistack, 'handleStatus').and.callThrough()
        unistack.initCoreProcess(mockCoreInstancePath).then(({ coreProcess }) => {
            globalCoreProcess = coreProcess
        })
        .catch(e => console.error(e.stack))
    })
})

describe ('UniStackCLI handleStatus()', () => {
    it ('should handle unknown status updates from core', () => {
        const unistack = new UniStackCLI
        const status = {
            type: 'unknown_status',
            data: 'mystery'
        }
        unistack.statusNotFound = () => {}
        spyOn(unistack, 'statusNotFound').and.callThrough()
        unistack.handleStatus(status)
        expect(unistack.statusNotFound).toHaveBeenCalledTimes(1)
        expect(unistack.statusNotFound).toHaveBeenCalledWith(status)
    })
})

describe ('UniStackCLI statusNotFound()', () => {
    it ('should handle unknown status updates from core', () => {
        const unistack = new UniStackCLI
        const status = {
            type: 'unknown_status',
            data: 'mystery'
        }
        spyOn(unistack, 'statusNotFound').and.callThrough()
        unistack.statusNotFound(status)
        expect(unistack.statusNotFound).toHaveBeenCalledWith(status)
    })
})
