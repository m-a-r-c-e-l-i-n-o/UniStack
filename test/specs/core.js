import Fs from 'fs-extra'
import Path from 'path'
import IOClient from 'socket.io-client'
import UniStack from '../../src/core.js'
import State from '../../src/core-state.js'
import Config from '../../config.js'
import Transport from '../../src/transport/index.js'
import ServerDestroy from 'server-destroy'
import Mock from 'mock-require'

const unistackPath = Path.join(__dirname, '..', '..')
const unistackTmpPath = Path.join(unistackPath, 'tmp')
const unistackTmpTestPath = Path.join(unistackTmpPath, 'test')
const unistackEnvPath = Path.join(unistackPath, 'environment')
const envPath = Config.environment.directory
const envUnistackPath = Path.join(envPath, 'node_modules', 'unistack')
const envUnistackBootstrapPath = Path.join(envUnistackPath, 'bootstrap')
const baseCommand = ['node', 'unistack']
const setupCommand = ['node', 'unistack', '--setup']
const basicConfig = `module.exports = function( config ) {
    config.set({
        hello: 'from mocked unistack.config.js'
    })
}`
const basicPackageJSON = `{
  "name": "basic-app",
  "version": "1.0.0",
  "description": "",
  "main": "unistack.config.js",
  "scripts": {
    "test": "nope"
  },
  "author": "",
  "license": "ISC"
}`
const Message = Transport.create('message')

describe ('UniStack', () => {
    it ('should be a function.', () => {
        expect(typeof UniStack).toBe('function')
    })
})

describe ('UniStack constructor()', () => {
    it ('should instantiate a cache object', () => {
        const unistack = new UniStack()
        expect(typeof unistack.cache).toBe('object')
    })
})

describe ('UniStack getState()', () => {
    it ('should return a state object', () => {
        const unistack = new UniStack()
        expect(unistack.getState()).toEqual(State)
    })
    it ('should return a non-extendable object', () => {
        const unistack = new UniStack()
        const state = unistack.getState()
        expect(() => state.hello = 'world')
        .toThrowError('Can\'t add property hello, object is not extensible')
    })
    it ('should cache state object', () => {
        const unistack = new UniStack()
        const state = unistack.getState()
        expect(unistack.getState()).toBe(state)
    })
})

describe ('UniStack getSystemConstants()', () => {
    it ('should return a root property with unistack\'s root path', () => {
        const unistack = new UniStack()
        const system = unistack.getSystemConstants()
        expect(system.root).toBe(unistackPath)
    })
    it ('should return an property with the environment\'s root path', () => {
        const unistack = new UniStack()
        const system = unistack.getSystemConstants()
        expect(system.environment.root).toBe(envPath)
    })
    it ('should return an property with the environment\'s unistack root path', () => {
        const unistack = new UniStack()
        const system = unistack.getSystemConstants()
        expect(system.environment.unistack.root).toBe(envUnistackPath)
    })
    it ('should cache system object', () => {
        const unistack = new UniStack()
        const system = unistack.getSystemConstants()
        expect(unistack.getSystemConstants()).toBe(system)
    })
})

describe ('UniStack initTransports()', () => {
    it ('should create a message transport', (done) => {
        const unistack = new UniStack()
        const state = { transport: {} }
        const messageTransport = {}
        const transport = { create: type => {
            expect(type).toBe('message')
            done()
        }}
        unistack.getTransport = () => transport.create
        unistack.getState = () => state
        unistack.initTransports()
    })
    it ('should store the message in the state object', () => {
        const unistack = new UniStack()
        const state = { transport: {} }
        const messageTransport = {}
        const transport = { create: () => messageTransport }

        unistack.getTransport = () => transport.create
        unistack.getState = () => state
        unistack.initTransports()

        expect(state.transport.message).toBe(messageTransport)
    })
})

describe ('UniStack getTransport()', () => {
    it ('should return create message function', () => {
        const unistack = new UniStack()
        expect(unistack.getTransport('message'))
        .toEqual(Transport.create)
    })
})

describe ('UniStack listenToCLI()', () => {
    it ('should resolve the promise when a "CORE_CLOSE" message is emitted', (done) => {
        const mockIPC = {
            fix: () => {},
            on: (event, callback) => {
                callback({ type: 'success', action: 'CORE_CLOSE' })
            }
        }
        Mock('ipc-event-emitter', { default: () => mockIPC })
        const unistack = new UniStack()
        unistack.getState = () => {
            return {
                transport: { message: () => {} },
                cli: { ipc: null }
            }
        }
        unistack.listenToCLI().then(() => {
            Mock.stop('ipc-event-emitter')
            done()
        })
    })
    it ('should store the cli ipc in the state object', (done) => {
        const mockIPC = {
            fix: () => {},
            on: (event, callback) => {
                callback({ type: 'success', action: 'CORE_CLOSE' })
            }
        }
        Mock('ipc-event-emitter', { default: () => mockIPC })
        const unistack = new UniStack()
        const state = {
            transport: { message: () => {} },
            cli: { ipc: null }
        }
        unistack.getState = () => state
        unistack.listenToCLI().then(ipc => {
            expect(state.cli.ipc).toBe(ipc)
            Mock.stop('ipc-event-emitter')
            done()
        })
        .catch(e => console.error(e.stack))
    })
    it ('should emit a core ready event', (done) => {
        const mockIPC = {
            fix: jasmine.createSpy('fix'),
            on: (event, callback) => {
                callback({ type: 'success', action: 'CORE_CLOSE' })
            }
        }
        Mock('ipc-event-emitter', { default: () => mockIPC })
        const unistack = new UniStack()
        const readyMessage = { type: 'success', action: 'CORE_READY' }
        unistack.getState = () => {
            return {
                transport: {
                    message: () => readyMessage
                },
                cli: { ipc: null }
            }
        }
        unistack.listenToCLI().then(() => {
            Mock.stop('ipc-event-emitter')
            done()
        })
        expect(mockIPC.fix).toHaveBeenCalledTimes(1)
        expect(mockIPC.fix).toHaveBeenCalledWith('message', readyMessage)
    })
})

describe ('UniStackCLI emitEventToCLI()', () => {
    it ('should emit messages to the CLI', (done) => {
        const unistack = new UniStack
        const mockEvent = Message('success', 'MOCK_TEST_MESSAGE')
        const mockIPC = {
            emit: (type, event) => {
                expect(type).toBe('message')
                expect(event).toBe(mockEvent)
                done()
            }
        }
        unistack.getState = () => {
            return {
                cli: {
                    ipc: mockIPC
                }
            }
        }
        unistack.emitEventToCLI(mockEvent)
    })
})

describe ('UniStack resolveConfig()', () => {
    let unistack
    beforeEach(() => {
        unistack = new UniStack()
        unistack.getState = () => {
            return {
                transport: {
                    message: Message
                }
            }
        }
    })
    it ('should default to an empty object when config is not a string or object', (done) => {
        unistack.resolveConfig().then(result => {
            expect(result).toEqual({})
            done()
        })
    })
    it ('should return object when an object is passed in', (done) => {
        const config = {}
        unistack.resolveConfig(config).then(result => {
            expect(result).toBe(config)
            done()
        })
    })
    it ('should resolve a config filename', (done) => {
        const config = 'unistack.config.js'
        const configFile = Path.join(envPath, config)
        Fs.writeFileSync(configFile, basicConfig)
        unistack.resolveConfig(config).then(result => {
            expect(result).toEqual({
                hello: 'from mocked unistack.config.js'
            })
            delete require.cache[configFile]
            Fs.removeSync(configFile)
            done()
        })
    })
    it ('should emit error when file is not found', (done) => {
        const config = 'unistack.config.not.found.js'
        const configFile = Path.join(envPath, config)
        const mockErrorMessage = Message('error', 'INVALID_CONFIG_PATH', {
            'FILENAME': configFile
        })
        unistack.resolveConfig(config).catch(errorMessage => {
            expect(errorMessage).toEqual(mockErrorMessage)
            done()
        })
    })
})

describe ('UniStack isEnvironmentEmpty()', () => {
    const unistack = new UniStack()
    const tmpEnvRename = Path.join(unistackTmpPath, 'environment')
    beforeEach(() => {
        // backup current enviroment
        Fs.renameSync(envPath, tmpEnvRename)
    })
    afterEach(() => {
        // reinstate backup
        Fs.renameSync(tmpEnvRename, envPath)
    })
    it ('should throw error when environment directory is not empty', (done) => {
        // set up new environment
        Fs.copySync(unistackEnvPath, envPath)
        const mockResult = {
            message: 'INSTALLATION_DIRECTORY_IS_POPULATED'
        }
        unistack.isEnvironmentEmpty().catch(result => {
            expect(result).toEqual(mockResult)
            // remove new environment
            Fs.removeSync(envPath)
            done()
        })
    })
    it ('should resolve when environment directory is empty', (done) => {
        // set up new environment
        Fs.ensureDirSync(envPath)
        unistack.isEnvironmentEmpty().then(done)
        .catch(e => console.log(e.stack)) // catch errors in previous blocks
        // remove new environment
        Fs.removeSync(envPath)
    })
})

describe ('UniStack initSetup()', () => {
    const unistack = new UniStack()
    unistack.isEnvironmentEmpty = () => Promise.resolve()
    unistack.setupPackageJSON = () => Promise.resolve()
    unistack.setupEnvironment = () => Promise.resolve()
    unistack.installJSPMDependencies = () => Promise.resolve()
    unistack.installNPMDependencies = () => Promise.resolve()

    it ('should call the "isEnvironmentEmpty" method', (done) => {
        spyOn(unistack, 'isEnvironmentEmpty')
        unistack.initSetup()
        .then(() => {
            expect(unistack.isEnvironmentEmpty).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should call the "setupPackageJSON" method', (done) => {
        spyOn(unistack, 'setupPackageJSON')
        unistack.initSetup()
        .then(() => {
            expect(unistack.setupPackageJSON).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should call the "setupEnvironment" method', (done) => {
        spyOn(unistack, 'setupEnvironment')
        unistack.initSetup()
        .then(() => {
            expect(unistack.setupEnvironment).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should call the "installJSPMDependencies" method', (done) => {
        spyOn(unistack, 'installJSPMDependencies')
        unistack.initSetup()
        .then(() => {
            expect(unistack.installJSPMDependencies).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should call the "installNPMDependencies" method', (done) => {
        spyOn(unistack, 'installNPMDependencies')
        unistack.initSetup()
        .then(() => {
            expect(unistack.installNPMDependencies).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should throw errors if something went wrong', (done) => {
        const mockError = new Error('fatal')
        let errorCount = 5
        unistack.handleUnexpectedError = e => { // mock error function
            expect(e).toBe(mockError)
            if (--errorCount === 0) {
                done()
            }
        }

        const promiseError = () => Promise.resolve().then(() => { throw mockError })
        unistack.isEnvironmentEmpty = promiseError
        Promise.resolve()
        .then(() => unistack.initSetup())
        .then(() => {
            unistack.isEnvironmentEmpty = () => Promise.resolve()
            unistack.setupPackageJSON = promiseError
            return Promise.resolve()
        })
        .then(() => unistack.initSetup())
        .then(() => {
            unistack.setupPackageJSON = () => Promise.resolve()
            unistack.setupEnvironment = promiseError
            return Promise.resolve()
        })
        .then(() => unistack.initSetup())
        .then(() => {
            unistack.setupEnvironment = () => Promise.resolve()
            unistack.installJSPMDependencies = promiseError
            return Promise.resolve()
        })
        .then(() => unistack.initSetup())
        .then(() => {
            unistack.installJSPMDependencies = () => Promise.resolve()
            unistack.installNPMDependencies = promiseError
            return Promise.resolve()
        })
        .then(() => unistack.initSetup())
        .catch(e => console.log(e.stack)) // catch errors in previous blocks
    })
})

describe ('UniStack startDevEnvironment()', () => {
    const unistack = new UniStack()
    unistack.isUnistackEnvironment = () => Promise.resolve()
    unistack.initNodeBundle = () => Promise.resolve()
    unistack.initBrowserBundle = () => Promise.resolve()
    unistack.initReloader = () => Promise.resolve()
    unistack.watchFiles = () => Promise.resolve()
    unistack.runNodeBundle = () => Promise.resolve()

    it ('should call the "isUnistackEnvironment" method', (done) => {
        spyOn(unistack, 'isUnistackEnvironment')
        unistack.startDevEnvironment()
        .then(() => {
            expect(unistack.isUnistackEnvironment).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should call the "initNodeBundle" method', (done) => {
        spyOn(unistack, 'initNodeBundle')
        unistack.startDevEnvironment()
        .then(() => {
            expect(unistack.initNodeBundle).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should call the "initBrowserBundle" method', (done) => {
        spyOn(unistack, 'initBrowserBundle')
        unistack.startDevEnvironment()
        .then(() => {
            expect(unistack.initBrowserBundle).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should call the "initReloader" method', (done) => {
        spyOn(unistack, 'initReloader')
        unistack.startDevEnvironment()
        .then(() => {
            expect(unistack.initReloader).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should call the "watchFiles" method', (done) => {
        spyOn(unistack, 'watchFiles')
        unistack.startDevEnvironment()
        .then(() => {
            expect(unistack.watchFiles).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should call the "runNodeBundle" method', (done) => {
        spyOn(unistack, 'runNodeBundle')
        unistack.startDevEnvironment()
        .then(() => {
            expect(unistack.runNodeBundle).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should throw errors if something went wrong', (done) => {
        const mockError = new Error('fatal')
        let errorCount = 5
        unistack.handleUnexpectedError = e => { // mock error function
            expect(e).toEqual(mockError)
            if (--errorCount === 0) {
                done()
            }
        }

        const promiseError = () => Promise.resolve().then(() => { throw mockError })

        unistack.initNodeBundle = promiseError
        Promise.resolve()
        .then(() => unistack.startDevEnvironment())
        .then(() => {
            unistack.initNodeBundle = () => Promise.resolve()
            unistack.initBrowserBundle = promiseError
            return Promise.resolve()
        })
        .then(() => unistack.startDevEnvironment())
        .then(() => {
            unistack.initBrowserBundle = () => Promise.resolve()
            unistack.initReloader = promiseError
            return Promise.resolve()
        })
        .then(() => unistack.startDevEnvironment())
        .then(() => {
            unistack.initReloader = () => Promise.resolve()
            unistack.watchFiles = promiseError
            return Promise.resolve()
        })
        .then(() => unistack.startDevEnvironment())
        .then(() => {
            unistack.watchFiles = () => Promise.resolve()
            unistack.runNodeBundle = promiseError
            return Promise.resolve()
        })
        .then(() => unistack.startDevEnvironment())
        .catch(e => console.log(e.stack)) // catch errors in previous blocks
    })
})

describe ('UniStack stopDevEnvironment()', () => {
    const unistack = new UniStack()
    unistack.haltNodeBundle = () => Promise.resolve()
    unistack.destroyReloader = () => Promise.resolve()
    unistack.destroyWatcher = () => Promise.resolve()

    it ('should return a promise', (done) => {
        const promise = unistack.stopDevEnvironment()
        expect(typeof promise.then).toBe('function')
        promise.then(done)
    })
    it ('should terminate node bundle\'s process', (done) => {
        spyOn(unistack, 'haltNodeBundle')
        unistack.stopDevEnvironment()
        .then(() => {
            expect(unistack.haltNodeBundle).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should destroy reloader server', (done) => {
        spyOn(unistack, 'destroyReloader')
        unistack.stopDevEnvironment()
        .then(() => {
            expect(unistack.destroyReloader).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should destroy watcher server', (done) => {
        spyOn(unistack, 'destroyWatcher')
        unistack.stopDevEnvironment()
        .then(() => {
            expect(unistack.destroyWatcher).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should throw errors if something went wrong', (done) => {
        const mockError = new Error('fatal')
        let errorCount = 3
        unistack.handleUnexpectedError = e => { // mock error function
            expect(e).toEqual(mockError)
            if (--errorCount === 0) {
                done()
            }
        }

        const promiseError = () => Promise.resolve().then(() => { throw mockError })

        unistack.haltNodeBundle = promiseError
        Promise.resolve()
        .then(() => unistack.stopDevEnvironment())
        .then(() => {
            unistack.haltNodeBundle = () => Promise.resolve()
            unistack.destroyReloader = promiseError
            return Promise.resolve()
        })
        .then(() => unistack.stopDevEnvironment())
        .then(() => {
            unistack.destroyReloader = () => Promise.resolve()
            unistack.destroyWatcher = promiseError
            return Promise.resolve()
        })
        .then(() => unistack.stopDevEnvironment())
        .catch(e => console.log(e.stack)) // catch errors in previous blocks
    })
})

describe ('UniStack handleUnexpectedError()', () => {
    it ('should emit event to the CLI', (done) => {
        const unistack = new UniStack()
        const mockError = new Error('fatal')
        const mockErrorMessage = Message('error', 'UNEXPECTED_CORE_ERROR', {
            'ERROR_STACK': mockError.stack || mockError
        })

        unistack.getState = () => {
            return {
                transport: {
                    message: Message
                }
            }
        }
        unistack.emitEventToCLI = (errorMessage) => {
            expect(errorMessage).toEqual(mockErrorMessage)
            done()
        }
        unistack.handleUnexpectedError(mockError)
    })
    it ('should handle errors without a stack', (done) => {
        const unistack = new UniStack()
        const mockError = new Error('fatal')
        mockError.stack = undefined
        const mockErrorMessage = Message('error', 'UNEXPECTED_CORE_ERROR', {
            'ERROR_STACK': mockError.stack || mockError
        })

        unistack.getState = () => {
            return {
                transport: {
                    message: Message
                }
            }
        }
        unistack.emitEventToCLI = (errorMessage) => {
            expect(errorMessage).toEqual(mockErrorMessage)
            done()
        }
        unistack.handleUnexpectedError(mockError)
    })
})

describe ('UniStack rebuildBundles()', () => {
    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should only rebuild browser bundle', (done) => {
        const unistack = new UniStack()
        const browserSpy = jasmine.createSpy('browserSpy')
        const nodeSpy = jasmine.createSpy('nodeSpy')
        // mock bundler
        unistack.getState = () => {
            return {
                environment: {
                    bundles: {
                        browser: {
                            bundler: {
                                build: () => Promise.resolve(browserSpy('browser'))
                            }
                        },
                        node: {
                            bundler: {
                                build: () => Promise.resolve(nodeSpy('node'))
                            }
                        }
                    }
                }
            }
        }
        unistack.rebuildBundles({ browser: true })
        .then(() => {
            expect(browserSpy).toHaveBeenCalledTimes(1)
            expect(browserSpy).toHaveBeenCalledWith('browser')
            expect(nodeSpy).not.toHaveBeenCalled()
            done()
        })
        .catch(e => console.log(e.stack)) // catch errors in previous blocks
    })
    it ('should only rebuild node bundle', (done) => {
        const unistack = new UniStack()
        const browserSpy = jasmine.createSpy('browserSpy')
        const nodeSpy = jasmine.createSpy('nodeSpy')
        // mock bundler
        unistack.getState = () => {
            return {
                environment: {
                    bundles: {
                        browser: {
                            bundler: {
                                build: () => Promise.resolve(browserSpy('browser'))
                            }
                        },
                        node: {
                            bundler: {
                                build: () => Promise.resolve(nodeSpy('node'))
                            }
                        }
                    }
                }
            }
        }
        // mock emit event
        unistack.emitEvent = () => {}
        unistack.rebuildBundles({ node: true })
        .then(() => {
            expect(nodeSpy).toHaveBeenCalledTimes(1)
            expect(nodeSpy).toHaveBeenCalledWith('node')
            expect(browserSpy).not.toHaveBeenCalled()
            done()
        })
        .catch(e => console.log(e.stack)) // catch errors in previous blocks
    })
    it ('should only rebuild browser and node bundles', (done) => {
        const unistack = new UniStack()
        const browserSpy = jasmine.createSpy('browserSpy')
        const nodeSpy = jasmine.createSpy('nodeSpy')
        // mock bundler
        unistack.getState = () => {
            return {
                environment: {
                    bundles: {
                        browser: {
                            bundler: {
                                build: () => Promise.resolve(browserSpy('browser'))
                            }
                        },
                        node: {
                            bundler: {
                                build: () => Promise.resolve(nodeSpy('node'))
                            }
                        }
                    }
                }
            }
        }
        // mock emit event
        unistack.emitEvent = () => {}
        unistack.rebuildBundles({ browser: true, node: true })
        .then(() => {
            expect(browserSpy).toHaveBeenCalledTimes(1)
            expect(browserSpy).toHaveBeenCalledWith('browser')
            expect(nodeSpy).toHaveBeenCalledTimes(1)
            expect(nodeSpy).toHaveBeenCalledWith('node')
            done()
        })
        .catch(e => console.log(e.stack)) // catch errors in previous blocks
    })
    it ('should emit a "reload" event if node rebundled do server file changes', (done) => {
        const unistack = new UniStack()
        const browserSpy = jasmine.createSpy('browserSpy')
        const nodeSpy = jasmine.createSpy('nodeSpy')
        // mock bundler
        unistack.getState = () => {
            return {
                environment: {
                    bundles: {
                        browser: {
                            bundler: {
                                build: () => Promise.resolve(browserSpy('browser'))
                            }
                        },
                        node: {
                            bundler: {
                                build: () => Promise.resolve(nodeSpy('node'))
                            }
                        }
                    }
                }
            }
        }
        // mock emit event
        unistack.emitEvent = event => {
            expect(event).toBe('reload')
            done()
        }
        unistack.rebuildBundles({ browser: true, node: true, explicitNode: true })
        .catch(e => console.log(e.stack)) // catch errors in previous blocks
    })
    it ('should handle errors thrown by the bundlers', (done) => {
        const unistack = new UniStack()
        const mockError = new Error('Mock Error!')
        // mock bundler
        unistack.getState = () => {
            return {
                environment: {
                    bundles: {
                        node: {
                            bundler: {
                                build: () => Promise.reject(mockError)
                            }
                        }
                    }
                }
            }
        }
        unistack.handleUnexpectedError = e => { // mock error function
            expect(e).toEqual(mockError)
            done()
        }
        unistack.rebuildBundles({ node: true })
        .catch(e => console.log(e.stack)) // catch errors in previous blocks
    })
})

describe ('UniStack setupEnvironment()', () => {
    const unistack = new UniStack()
    const tmpEnvRename = Path.join(unistackTmpPath, 'environment')

    beforeEach(() => {
        // backup current enviroment
        Fs.renameSync(envPath, tmpEnvRename)
        // set new enviroment
        Fs.ensureDirSync(envPath)
    })
    afterEach(() => {
        // remove new enviroment
        Fs.removeSync(envPath)
        // reinstate backup
        Fs.renameSync(tmpEnvRename, envPath)
    })
    it ('should create files and folders in the environment directory', () => {
        const clientFolder = Path.join(envPath, 'src','client')
        const serverFolder = Path.join(envPath, 'src','server')
        const sharedFolder = Path.join(envPath, 'src','shared')
        unistack.setupEnvironment().then(() => {
            const filenames = [
                Path.join(clientFolder, 'index.js'),
                Path.join(clientFolder, 'css', 'preprocessor', 'production.js'),
                Path.join(clientFolder, 'css', 'preprocessor', 'development.js'),
                Path.join(clientFolder, 'test', 'specs', 'index.js'),
                Path.join(serverFolder, 'components', 'layout.js'),
                Path.join(serverFolder, 'test', 'specs', 'index.js'),
                Path.join(serverFolder, 'index.js'),
                Path.join(sharedFolder, 'routes.js'),
                Path.join(sharedFolder, 'actions', 'index.js'),
                Path.join(sharedFolder, 'components', '404.js'),
                Path.join(sharedFolder, 'components', 'App.js'),
                Path.join(sharedFolder, 'components', 'HelloWorld.js'),
                Path.join(sharedFolder, 'containers', 'index.js'),
                Path.join(sharedFolder, 'reducers', 'index.js')
            ]
            filenames.forEach(filename => {
                expect(() => Fs.lstatSync(filename)).not.toThrowError()
            })
        })
        .catch(e => console.log(e.stack)) // catch errors in previous blocks
    })
})

describe ('UniStack destroyProject()', () => {
    const unistack = new UniStack()
    const tmpEnvRename = Path.join(unistackTmpPath, 'environment')

    beforeEach(() => {
        // backup current enviroment
        Fs.renameSync(envPath, tmpEnvRename)
        // set new (populated) enviroment
        Fs.copySync(tmpEnvRename, envPath)
    })
    afterEach(() => {
        // remove new enviroment
        Fs.removeSync(envPath)
        // reinstate backup
        Fs.renameSync(tmpEnvRename, envPath)
    })
    it ('should empty environment directory', () => {
        unistack.destroyProject()
        expect(Fs.readdirSync(envPath).length).toBe(0)
    })
})

describe ('UniStack.setupPackageJSON()', () => {
    it ('should copy package.json file to environment directory', (done) => {
        const unistack = new UniStack()
        unistack.setupPackageJSON().then(() => {
            const packageJSONFile = Path.join(envPath, 'package.json')
            expect(() => Fs.lstatSync(packageJSONFile)).not.toThrowError()
            Fs.removeSync(packageJSONFile)
            done()
        })
        .catch(e => console.log(e.stack || e)) // catch errors in previous blocks
    })
    it ('should populate jspm asset paths', (done) => {
        const unistack = new UniStack()
        unistack.setupPackageJSON().then(() => {
            const packageJSONFile = Path.join(envPath, 'package.json')
            const packageJSONObj = require(packageJSONFile)
            const jspm = packageJSONObj.jspm
            expect(jspm.configFiles.jspm)
            .toBe('node_modules/unistack/bootstrap/jspm.config.js')
            expect(jspm.directories.packages)
            .toBe('node_modules/unistack/bootstrap/jspm_packages')
            Fs.removeSync(packageJSONFile)
            done()
        })
        .catch(e => console.log(e.stack || e)) // catch errors in previous blocks
    })
    it ('should contain a unistack property', (done) => {
        const unistack = new UniStack()
        unistack.setupPackageJSON().then(() => {
            const packageJSONFile = Path.join(envPath, 'package.json')
            const packageJSONObj = require(packageJSONFile)
            expect(packageJSONObj.unistack).toBeTruthy()
            Fs.removeSync(packageJSONFile)
            done()
        })
        .catch(e => console.log(e.stack || e)) // catch errors in previous blocks
    })
})

describe ('UniStack.isUnistackEnvironment()', () => {
    const tmpPackageJSONFile = Path.join(unistackTmpTestPath, 'package.json')
    it ('should resolve when unistack property is present in package.json file', (done) => {
        const unistack = new UniStack()
        // package.json path
        unistack.cache.system = {
            environment: {
                root: unistackTmpTestPath
            }
        }
        Fs.outputFileSync(tmpPackageJSONFile, JSON.stringify({ unistack: true }))
        unistack.isUnistackEnvironment(tmpPackageJSONFile).then(() => {
            const tmpPackageJSONObj = require(tmpPackageJSONFile)
            expect(tmpPackageJSONObj.unistack).toBeTruthy()
            Fs.removeSync(tmpPackageJSONFile)
            delete require.cache[tmpPackageJSONFile]
            done()
        })
        .catch(e => console.log(e.stack || e)) // catch errors in previous blocks
    })
    it ('should throw error when unistack property is falsy', (done) => {
        const unistack = new UniStack()
        const errorMock = { message: 'NOT_UNISTACK_ENVIRONMENT' }
        Fs.outputFileSync(tmpPackageJSONFile, JSON.stringify({}))
        // package.json path
        unistack.cache.system = {
            environment: {
                root: unistackTmpTestPath
            }
        }
        unistack.isUnistackEnvironment()
        .catch(error => {
            expect(error).toEqual(errorMock)
            Fs.removeSync(tmpPackageJSONFile)
            delete require.cache[tmpPackageJSONFile]
            done()
        })
    })
    it ('should throw error when package.json file could not be required', (done) => {
        const unistack = new UniStack()
        const errorMock = { message: 'NO_ENVIRONMENT_PACKAGE_JSON_FILE' }
        // package.json path
        unistack.cache.system = {
            environment: {
                root: unistackTmpTestPath
            }
        }
        unistack.isUnistackEnvironment()
        .catch(error => {
            expect(error).toEqual(errorMock)
            done()
        })
    })
})

if (!process.env.QUICK_TEST_RUN) {
    describe ('UniStack installNPMDependencies()', () => {
        const unistack = new UniStack()
        const tmpEnvRename = Path.join(unistackTmpPath, 'environment')

        let originalTimeout
        beforeEach(() => {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 240000
            // backup current enviroment
            Fs.renameSync(envPath, tmpEnvRename)
            // set new enviroment
            Fs.ensureDirSync(envPath)
        })
        afterEach(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
            // remove new enviroment
            Fs.removeSync(envPath)
            // reinstate backup
            Fs.renameSync(tmpEnvRename, envPath)
        })
        it ('should install npm dependencies', (done) => {
            console.log('--Testing installation of NPM dependencies!')
            Promise.resolve()
            .then(() => unistack.isEnvironmentEmpty())
            .then(() => unistack.setupPackageJSON())
            .then(() => unistack.installNPMDependencies())
            .then(passed => {
                const packages = Path.join(envPath, 'node_modules')
                expect(passed).toBe(true)
                expect(() => Fs.lstatSync(packages)).not.toThrowError()
                expect(Fs.readdirSync(packages).length).toBeGreaterThan(0)
                done()
            })
            .catch(e => console.log(e.stack)) // catch errors in previous blocks
        })
        it ('should throw errors if something went wrong', (done) => {
            unistack.installNPMDependencies('npm invalid install')
            .catch(e => {
                expect(e instanceof Error).toBe(true)
                done()
            })
        })
    })
}

describe ('UniStack initReloader()', () => {
    it ('should start reloader server', (done) => {
        const unistack = new UniStack()
        unistack.initReloader()
        .then(reloader => {
            expect(typeof reloader.io.emit).toBe('function')
            expect(typeof reloader.io.on).toBe('function')
            reloader.server.destroy(done)
        })
        .catch(e => console.error(e.stack))
    })
    it ('should store the reloader server and io in state object', (done) => {
        const unistack = new UniStack()
        unistack.initReloader()
        .then(reloader => {
            expect(unistack.cache.state.reloader.server).toBe(reloader.server)
            expect(unistack.cache.state.reloader.io).toBe(reloader.io)
            reloader.server.destroy(done)
        })
        .catch(e => console.error(e.stack))
    })
})

describe ('UniStack emitEvent()', () => {
    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should emit event with data', (done) => {
        const unistack = new UniStack()
        unistack.initReloader()
        .then(reloader => {
            return new Promise((resolve, reject) => {
                reloader.io.on('connection', socket => {
                    resolve()
                })
                const host = 'http://localhost:' + Config.server.reloaderPort
                const clientSocket = IOClient.connect(host, {
                    'reconnection delay' : 0,
                    'reopen delay' : 0,
                    'force new connection' : true
                })
                clientSocket.once('echo', data => {
                    expect(data).toBe('hello')
                    reloader.server.destroy(done)
                })
            })
        })
        .then(() => unistack.emitEvent('echo', 'hello'))
        .catch(e => console.log(e.stack)) // catch errors in previous blocks
    })
})

describe ('UniStack handleFileChange()', () => {
    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should trigger rebuild for node bundle only', (done) => {
        const unistack = new UniStack()
        unistack.emitEvent = () => {}
        unistack.rebuildBundles = config => {
            expect(config.node).toBe(true)
            expect(config.browser).toBe(false)
            expect(config.explicitNode).toBe(true)
            done()
        }
        const serverFile = Path.join(envPath, 'src', 'server', 'index.js')
        unistack.handleFileChange(serverFile)
    })
    it ('should trigger rebuild for browser bundle only', (done) => {
        const unistack = new UniStack()
        unistack.emitEvent = () => {}
        unistack.rebuildBundles = config => {
            expect(config.browser).toBe(true)
            expect(config.node).toBe(false)
            expect(config.explicitNode).toBe(false)
            done()
        }
        const serverFile = Path.join(envPath, 'src', 'client', 'index.js')
        unistack.handleFileChange(serverFile)
    })
    it ('should trigger rebuild for browser and node bundles', (done) => {
        const unistack = new UniStack()
        unistack.emitEvent = () => {}
        unistack.rebuildBundles = config => {
            expect(config.browser).toBe(true)
            expect(config.node).toBe(true)
            expect(config.explicitNode).toBe(false)
            done()
        }
        const serverFile = Path.join(envPath, 'src', 'shared', 'index.js')
        unistack.handleFileChange(serverFile)
    })
    it ('should throttle rebuild trigger for two seconds', (done) => {
        const unistack = new UniStack()
        let timer = 0
        const interval = setInterval(() => timer++, 100)
        unistack.emitEvent = () => {}
        unistack.rebuildBundles = config => {
            // test against 1.5 seconds with a 0.5 second buffer
            expect(timer).toBeGreaterThan(15)
            clearInterval(interval)
            done()
        }
        const serverFile = Path.join(envPath, 'src', 'shared', 'index.js')
        unistack.handleFileChange(serverFile)
    })
    it ('should merge multiple bundle requests within throttle', (done) => {
        const unistack = new UniStack()
        unistack.emitEvent = () => {}
        unistack.rebuildBundles = config => {
            expect(config.browser).toBe(true)
            expect(config.node).toBe(true)
            expect(config.explicitNode).toBe(true)
            done()
        }
        const clientFile = Path.join(envPath, 'src', 'client', 'index.js')
        const serverFile = Path.join(envPath, 'src', 'server', 'index.js')
        unistack.handleFileChange(serverFile)
        unistack.handleFileChange(clientFile)
        unistack.handleFileChange(serverFile) // ensure no overwrites
    })
    it ('should trigger "change" event when triggering non-node bundle', (done) => {
        const unistack = new UniStack()
        unistack.rebuildBundles = config => {
            expect(config.browser).toBe(true)
            expect(config.node).toBe(true)
            expect(config.explicitNode).toBe(false)
        }

        const clientFile = Path.join(envPath, 'src', 'client', 'index.js')
        unistack.emitEvent = (type, filename)  => {
            expect(type).toBe('change')
            expect(filename).toBe(clientFile)
        }
        unistack.handleFileChange(clientFile)

        const sharedFile = Path.join(envPath, 'src', 'shared', 'index.js')
        unistack.emitEvent = (type, filename)  => {
            expect(type).toBe('change')
            expect(filename).toBe(sharedFile)
            done()
        }
        unistack.handleFileChange(sharedFile)
    })
})

describe ('UniStack haltNodeBundle()', () => {
    const unistack = new UniStack()
    it ('should terminate node bundle\'s process', (done) => {
        unistack.getState = () => {
            return {
                environment: {
                    server: {
                        destroy: () => {
                            done()
                        }
                    }
                }
            }
        }
        unistack.haltNodeBundle().then(done)
    })
})

describe ('UniStack destroyReloader()', () => {
    const unistack = new UniStack()
    it ('should destroy reloader server', (done) => {
        unistack.getState = () => {
            return {
                reloader: {
                    server: {
                        destroy: () => {
                            done()
                        }
                    }
                }
            }
        }
        unistack.destroyReloader().then(done)
    })
})

describe ('UniStack destroyWatcher()', () => {
    it ('should destroy watcher server', (done) => {
        const unistack = new UniStack()
        const state = {
            watcher: {
                server: {
                    close: jasmine.createSpy('close')
                }
            }
        }
        unistack.getState = () => state
        unistack.destroyWatcher().then(() => {
            expect(state.watcher.server.close)
            .toHaveBeenCalledTimes(1)
            done()
        })
    })
})

if (!process.env.QUICK_TEST_RUN) {
    describe ('UniStack JSPM install dependent tests', () => {
        describe ('UniStack installJSPMDependencies()', () => {
            console.log('--Testing installation of JSPM dependencies!')
            // ############################ ATTENTION ############################
                // This it block has to remain as the first spec on this block.
                // This is, in part, do to the programatic jspm.install(true)
                // being a one time deal per process, and also helps with
                // performance, as jspm.install(true) takes time and there
                // is no benefit in running jspm.install(true) multiple times.
            // ############################ ATTENTION ############################
            const unistack = new UniStack()
            let originalTimeout
            beforeEach(() => {
                originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 240000
            })
            afterEach(() => {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
            })
            it ('should install jspm dependencies.', (done) => {
                const packagesPath = Path.join(envUnistackBootstrapPath, 'jspm_packages')
                Promise.resolve()
                .then(() => unistack.setupPackageJSON())
                .then(() => unistack.installJSPMDependencies())
                .then(() => {
                    expect(() => Fs.lstatSync(Path.join(packagesPath, 'npm')))
                    .not.toThrowError()
                    expect(() => Fs.lstatSync(Path.join(packagesPath, 'github')))
                    .not.toThrowError()
                    expect(() => Fs.lstatSync(Path.join(packagesPath, 'system.js')))
                    .not.toThrowError()
                    expect(() => Fs.lstatSync(Path.join(packagesPath, 'system.src.js')))
                    .not.toThrowError()
                    expect(() => Fs.lstatSync(Path.join(packagesPath, 'system.js.map')))
                    .not.toThrowError()
                    expect(() => Fs.lstatSync(Path.join(packagesPath, 'system-polyfills.js')))
                    .not.toThrowError()
                    expect(() => Fs.lstatSync(Path.join(packagesPath, 'system-polyfills.src.js')))
                    .not.toThrowError()
                    expect(() => Fs.lstatSync(Path.join(packagesPath, 'system-polyfills.js.map')))
                    .not.toThrowError()
                    done()
                }).catch(e => { console.log(e.stack) }) // catch errors in previous block
            })
        })

        describe ('UniStack bundle()', () => {
            const unistack = new UniStack()
            const entryFile = Path.join(envUnistackBootstrapPath, 'server', 'index.js')
            const outputFile = Path.join(envUnistackBootstrapPath, 'server', 'bundle.js')

            it ('should return an bundler object with a build method', () => {
                expect(unistack.bundle(entryFile, outputFile).build)
                .toEqual(jasmine.any(Function))
            })
            it ('should accept build options', () => {
                const buildOptions = {
                    sfx: true,
                    minify: true,
                    mangle: true,
                    sourceMaps: true,
                    lowResSourceMaps: true
                }
                const bundler = unistack.bundle(entryFile, outputFile, buildOptions)
                expect(bundler.buildOptions).toEqual(buildOptions)
            })
        })

        describe ('UniStack initNodeBundle()', () => {
            let originalTimeout
            beforeEach(() => {
                originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
            })
            afterEach(() => {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
            })
            it ('should initialize node production bundle', (done) => {
                const unistack = new UniStack()
                const nodeBundle = Path.join(envPath, 'dist', 'server.bundle.js')
                const buildOptions = {
                    sfx: true,
                    node: true,
                    production: true,
                    sourceMaps: true
                }
                unistack.initNodeBundle(true).then(bundler => {
                    expect(bundler.build).toEqual(jasmine.any(Function))
                    expect(bundler.buildOptions)
                    .toEqual(jasmine.objectContaining(buildOptions))
                    const bundle = require(nodeBundle).default
                    expect(bundle.environment).toBe('production')
                    return bundle
                })
                .then(bundle => bundle.serve)
                .then(server => {
                    delete require.cache[nodeBundle]
                    Fs.removeSync(nodeBundle)
                    Fs.removeSync(nodeBundle + '.map')
                    ServerDestroy(server)
                    server.destroy(done)
                })
                .catch(e => console.error(e.stack))
            })
            it ('should initialize node development bundle', (done) => {
                const unistack = new UniStack()
                const nodeBundle = Path.join(envUnistackBootstrapPath, 'server', 'server.bundle.js')
                const buildOptions = {
                    sfx: true,
                    node: true,
                    production: false,
                    sourceMaps: true
                }
                unistack.initNodeBundle().then(bundler => {
                    expect(bundler.build).toEqual(jasmine.any(Function))
                    expect(bundler.buildOptions)
                    .toEqual(jasmine.objectContaining(buildOptions))
                    const bundle = require(nodeBundle).default
                    expect(bundle.environment).toBe('development')
                    return bundle
                })
                .then(bundle => bundle.serve)
                .then(server => {
                    delete require.cache[nodeBundle]
                    Fs.removeSync(nodeBundle)
                    Fs.removeSync(nodeBundle + '.map')
                    ServerDestroy(server)
                    server.destroy(done)
                })
                .catch(e => console.error(e.stack))
            })
        })

        describe ('UniStack initBrowserBundle()', () => {
            let originalTimeout
            beforeEach(() => {
                originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
            })
            afterEach(() => {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
            })
            it ('should initialize browser production bundle', (done) => {
                const unistack = new UniStack()
                const browserBundle = Path.join(envPath, 'dist', 'client.bundle.js')
                const buildOptions = {
                    sourceMaps: true
                }
                unistack.initBrowserBundle().then(bundler => {
                    expect(bundler.build).toEqual(jasmine.any(Function))
                    expect(bundler.buildOptions)
                    .toEqual(jasmine.objectContaining(buildOptions))
                    expect(() => Fs.lstatSync(browserBundle)).not.toThrowError()
                    Fs.removeSync(browserBundle)
                    Fs.removeSync(browserBundle + '.map')
                    done()
                })
                .catch(e => console.error(e.stack))
            })
        })

        describe ('UniStack watchFiles()', () => {
            let originalTimeout
            beforeEach(() => {
                originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
            })
            afterEach(() => {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
            })
            it ('should return and fulfil a promise', (done) => {
                const unistack = new UniStack()
                unistack.watchFiles().then(gaze => {
                    gaze.close()
                    done()
                })
                .catch(e => console.error(e.stack))
            })
            it ('should return and fulfil a promise', (done) => {
                const unistack = new UniStack()
                const tmpFile = Path.join(envPath, 'file-watch-test.js')
                let globalGaze
                unistack.handleFileChange = filename => {
                    expect(tmpFile).toBe(filename)
                    Fs.removeSync(tmpFile)
                    globalGaze.close()
                    done()
                }
                Fs.writeFileSync(tmpFile, 'Hello')
                unistack.watchFiles().then(gaze => {
                    Fs.appendFileSync(tmpFile, 'World!')
                    globalGaze = gaze
                })
                .catch(e => console.error(e.stack))
            })
            it ('should store the watcher server in state object', (done) => {
                const unistack = new UniStack()
                const tmpFile = Path.join(envPath, 'file-watch-test.js')
                unistack.watchFiles().then(gaze => {
                    expect(unistack.cache.state.watcher.server).toBe(gaze)
                    gaze.close()
                    done()
                })
                .catch(e => console.error(e.stack))
            })
        })

        describe ('UniStack runNodeBundle()', () => {
            let originalTimeout
            beforeEach(() => {
                originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 40000
            })
            afterEach(() => {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
            })
            it ('should require the node bundle', (done) => {
                const unistack = new UniStack()
                const nodeBundle = Path.join(envUnistackBootstrapPath, 'server', 'server.bundle.js')
                unistack.initNodeBundle()
                .then(unistack.runNodeBundle.bind(unistack))
                .then(server => {
                    Fs.removeSync(nodeBundle)
                    Fs.removeSync(nodeBundle + '.map')
                    server.destroy(done)
                })
                .catch(e => console.error(e.stack))
            })
        })
    }) // End of UniStack JSPM install dependent tests
}
