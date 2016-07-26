import Fs from 'fs-extra'
import Path from 'path'
import IOClient from 'socket.io-client'
import { createServer as CreateServer } from 'http'
import UniStack from '../../src/unistack.js'
import Config from '../../config.js'
import BDDStdin from '../lib/bdd-stdin.js'
import serverDestroy from 'server-destroy'

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

describe ('UniStack', () => {
    it ('should be a function.', () => {
        expect(typeof UniStack).toBe('object')
    })
})

describe ('UniStack constructor()', () => {
    const UniStackMock = Object.assign({}, UniStack)
    UniStackMock.initDevEnvironment = () => {}
    UniStackMock.initInteractiveSetup = () => {}
    it ('should start dev enviroment if no flags are present', () => {
        spyOn(UniStackMock, 'initDevEnvironment')
        UniStackMock.constructor(baseCommand)
        expect(UniStackMock.initDevEnvironment).toHaveBeenCalledTimes(1)
    })
    it ('should initiate setup if "setup" flag is present', () => {
        spyOn(UniStackMock, 'initInteractiveSetup')
        UniStackMock.constructor(setupCommand)
        expect(UniStackMock.initInteractiveSetup).toHaveBeenCalledTimes(1)
    })
    it ('should throw fatal errors', () => {
        const error = new Error('Fatal')
        UniStackMock.initDevEnvironment = () => {
            throw error
        }
        expect(() => UniStackMock.constructor(baseCommand))
        .toThrowError('Fatal')
    })
})

describe ('UniStack resolveConfig()', () => {
    it ('should default to an empty object when config is not a string or object', () => {
        expect(UniStack.resolveConfig()).toEqual({})
    })
    it ('should return object when an object is passed in', () => {
        const config = {}
        expect(UniStack.resolveConfig(config)).toBe(config)
    })
    it ('should resolve a config filename', () => {
        const config = 'unistack.config.js'
        const configFile = Path.join(Config.environment.directory, config)
        Fs.writeFileSync(configFile, basicConfig)
        expect(UniStack.resolveConfig(config))
        .toEqual({
            hello: 'from mocked unistack.config.js'
        })
        Fs.unlinkSync(configFile)
    })
    it ('should throw error when file is not found', () => {
        const config = 'unistack.config.js'
        const configFile = Path.join(Config.environment.directory, config)
        delete require.cache[configFile]
        expect(() => UniStack.resolveConfig(config))
        .toThrowError(
            Config.errors.invalidConfigPath
            .replace('{{filename}}', configFile)
        )
    })
})

describe ('UniStack parseArguments()', () => {
    it ('should return a false properties when only base arguments are present', () => {
        UniStack.parseArguments(baseCommand, true)
        expect(UniStack.parseArguments(baseCommand, true)).toEqual({
            setup: undefined
        })
    })
    it ('should return an object with a truthy "setup" property when "--setup" is present', () => {
        expect(UniStack.parseArguments(setupCommand)).toEqual(jasmine.objectContaining({
            setup: true
        }))
    })
    it ('should return an object with falsy arguments when arguments are invalid', () => {
        UniStack.parseArguments()
        expect(UniStack.parseArguments()).toEqual({
            setup: undefined
        })
    })
    it ('should return an object with falsy arguments when arguments are invalid', (done) => {
        const processExit = process.exit
        process.exit = () => {
            process.exit = processExit
            done()
        }
        expect(() => UniStack.parseArguments(baseCommand.concat('--invalid')))
        .toThrowError()
    })
})

describe ('UniStack handleError()', () => {
    it ('should throw errors when 1st argument is present', () => {
        expect(() => UniStack.handleError(new Error('Fatal!')))
        .toThrowError('Fatal!')
    })
    it ('should log warning message when 2nd argument is present', () => {
        const consoleWarn = console.warn
        console.warn = (message) => {
            expect(message).toBe('Warning!')
        }
        expect(() => UniStack.handleError(new Error('Warning!'), true))
        .not.toThrowError()
        console.warn = consoleWarn
    })
    it ('should throw errors when 1st argument is string', () => {
        expect(() => UniStack.handleError('Fatal!'))
        .toThrowError('Fatal!')
    })
    it ('should log warning message when 1st argument is string & 2nd argument is present', () => {
        const consoleWarn = console.warn
        console.warn = (message) => {
            expect(message).toBe('Warning!')
        }
        expect(() => UniStack.handleError('Warning!', true))
        .not.toThrowError()
        console.warn = consoleWarn
    })
    it ('should call hook before fatal error when a hook function is provided', (done) => {
        const spy = jasmine.createSpy('spy')
        const hook = (error) => {
            spy(error)
            return false
        }
        const error = new Error('Fatal!')
        new Promise((revolve, reject) => {
            reject()
        })
        .catch(e => {
            UniStack.handleError(error, false, hook)
            expect(spy).toHaveBeenCalledTimes(1)
            expect(spy).toHaveBeenCalledWith(error)
            done()
        })
    })
})

describe ('UniStack throwError()', () => {
    it ('should throw error', () => {
        expect(() => UniStack.throwError(new Error('Fatal!')))
        .toThrowError('Fatal!')
    })
})

describe ('UniStack throwAsyncError()', () => {
    it ('should throw asynchronous error', (done) => {
        const spy = jasmine.createSpy('spy')
        const error = new Error('Fatal!')
        const MockUniStack = Object.assign({}, UniStack)
        MockUniStack.throwError = (error) => {
            spy(error)
        }
        MockUniStack.throwAsyncError(error)
        setTimeout((() => {
            return () => {
                expect(spy).toHaveBeenCalledTimes(1)
                expect(spy).toHaveBeenCalledWith(error)
                done()
            }
        })(), 1)
    })
})

describe ('UniStack validateInstallationDirectory()', () => {
    const unistack = Path.join(__dirname, '../../')
    const enviroment = Path.join(unistack, 'environment')
    const testEnviroment = Config.environment.directory
    const tmpTestEnvironmentRename = Path.join(unistack, 'tmp/environment')
    beforeEach(() => {
        // setup a clean enviroment
        Fs.renameSync(testEnviroment, tmpTestEnvironmentRename)
    })
    afterEach(() => {
        // put things back as they were
        Fs.removeSync(testEnviroment)
        Fs.renameSync(tmpTestEnvironmentRename, testEnviroment)
    })
    it ('should throw error when environment directory is not empty', () => {
        Fs.copySync(enviroment, testEnviroment)
        expect(() => UniStack.validateInstallationDirectory())
        .toThrowError(Config.errors.installationDirectoryIsPopulated)
    })
    it ('should remain silent when environment directory is empty', () => {
        Fs.ensureDirSync(testEnviroment)
        expect(() => UniStack.validateInstallationDirectory()).not.toThrowError()
    })
})

describe ('UniStack askSetupQuestions()', () => {
    it ('should return a promise', function (done) {
        const questions = UniStack.setupQuestions
        UniStack.setupQuestions = []
        const prompt = UniStack.askSetupQuestions()
        expect(typeof prompt.then).toBe('function')
        prompt.then(answers => done())
        UniStack.setupQuestions = questions
    })
    it ('should prompt user for the project name', (done) => {
        BDDStdin('unistack\n')
        const prompt = UniStack.askSetupQuestions()
        prompt.then(answers => {
            expect(answers['project_name']).toBe('unistack')
            done()
        })
    })
})

describe ('UniStack initSetup()', () => {
    const MockUniStack = Object.assign({}, UniStack)
    MockUniStack.validateInstallationDirectory = () => {}
    MockUniStack.setupPackageJSON = () => {}
    MockUniStack.copyBaseDirectoriesToProject = () => {}
    MockUniStack.installJSPMDependencies = () => Promise.resolve()
    MockUniStack.installNPMDependencies = () => Promise.resolve()
    it ('should return a promise', (done) => {
        const promise = MockUniStack.initSetup(baseCommand)
        expect(typeof promise.then).toBe('function')
        promise.then(answers => done())
    })
    it ('should validate installation directory.', () => {
        spyOn(MockUniStack, 'validateInstallationDirectory')
        MockUniStack.initSetup(baseCommand)
        expect(MockUniStack.validateInstallationDirectory).toHaveBeenCalledTimes(1)
    })
    it ('should setup "package.json".', () => {
        spyOn(MockUniStack, 'setupPackageJSON')
        MockUniStack.initSetup(baseCommand)
        expect(MockUniStack.setupPackageJSON).toHaveBeenCalledTimes(1)
    })
    it ('should copy base directories to project directory.', () => {
        spyOn(MockUniStack, 'copyBaseDirectoriesToProject')
        MockUniStack.initSetup(baseCommand)
        expect(MockUniStack.copyBaseDirectoriesToProject).toHaveBeenCalledTimes(1)
    })
    it ('should install jspm dependencies.', (done) => {
        spyOn(MockUniStack, 'installJSPMDependencies')
        MockUniStack.initSetup(baseCommand)
        .then(() => {
            expect(MockUniStack.installJSPMDependencies).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should install npm dependencies.', (done) => {
        spyOn(MockUniStack, 'installNPMDependencies')
        MockUniStack.initSetup(baseCommand)
        .then(() => {
            expect(MockUniStack.installNPMDependencies).toHaveBeenCalledTimes(1)
            done()
        })
    })
    it ('should throw errors if something went wrong', (done) => {
        const error = new Error('fatal')
        const promiseError = () => Promise.resolve().then(() => { throw error })
        let errors = 2
        // mock error function
        MockUniStack.handleError = e => {
            expect(e).toBe(error)
            if (--errors === 0) {
                done()
            }
        }
        MockUniStack.installNPMDependencies = promiseError
        Promise.resolve()
        .then(() => MockUniStack.initSetup(baseCommand))
        .then(() => {
            MockUniStack.installNPMDependencies = () => Promise.resolve()
            MockUniStack.installJSPMDependencies = promiseError
            return Promise.resolve()
        })
        .then(() => MockUniStack.initSetup(baseCommand))
        .catch(e => console.log(e.stack)) // to catch errors from top level blocks
    })
})

describe ('UniStack initInteractiveSetup()', () => {
    const MockUniStack = Object.assign({}, UniStack)
    MockUniStack.validateInstallationDirectory = () => {}
    MockUniStack.setupPackageJSON = () => {}
    MockUniStack.copyBaseDirectoriesToProject = () => {}
    MockUniStack.askSetupQuestions = () => Promise.resolve()
    MockUniStack.processSetupAnswers = () => Promise.resolve()
    MockUniStack.installJSPMDependencies = () => Promise.resolve()
    MockUniStack.installNPMDependencies = () => Promise.resolve()
    it ('should return a promise', function (done) {
        const promise = MockUniStack.initInteractiveSetup()
        expect(typeof promise.then).toBe('function')
        promise.then(answers => done())
    })
    it ('should validate installation directory.', () => {
        spyOn(MockUniStack, 'validateInstallationDirectory')
        MockUniStack.initInteractiveSetup(baseCommand)
        expect(MockUniStack.validateInstallationDirectory).toHaveBeenCalledTimes(1)
    })
    it ('should setup "package.json".', () => {
        spyOn(MockUniStack, 'setupPackageJSON')
        MockUniStack.initInteractiveSetup(baseCommand)
        expect(MockUniStack.setupPackageJSON).toHaveBeenCalledTimes(1)
    })
    it ('should copy base directories to project directory.', () => {
        spyOn(MockUniStack, 'copyBaseDirectoriesToProject')
        MockUniStack.initInteractiveSetup(baseCommand)
        expect(MockUniStack.copyBaseDirectoriesToProject).toHaveBeenCalledTimes(1)
    })
    it ('should ask setup questions.', (done) => {
        spyOn(MockUniStack, 'askSetupQuestions')
        MockUniStack.initInteractiveSetup(baseCommand)
        .then(() => {
            expect(MockUniStack.askSetupQuestions).toHaveBeenCalledTimes(1)
            MockUniStack.askSetupQuestions = () => Promise.resolve()
            done()
        })
    })
    it ('should process setup answers.', (done) => {
        spyOn(MockUniStack, 'processSetupAnswers')
        MockUniStack.initInteractiveSetup(baseCommand)
        .then(() => {
            expect(MockUniStack.processSetupAnswers).toHaveBeenCalledTimes(1)
            MockUniStack.processSetupAnswers = () => Promise.resolve()
            done()
        })
    })
    it ('should install jspm dependencies.', (done) => {
        spyOn(MockUniStack, 'installJSPMDependencies')
        MockUniStack.initInteractiveSetup(baseCommand)
        .then(() => {
            expect(MockUniStack.installJSPMDependencies).toHaveBeenCalledTimes(1)
            MockUniStack.installJSPMDependencies = () => Promise.resolve()
            done()
        })
    })
    it ('should install npm dependencies.', (done) => {
        spyOn(MockUniStack, 'installNPMDependencies')
        MockUniStack.initInteractiveSetup(baseCommand)
        .then(() => {
            expect(MockUniStack.installNPMDependencies).toHaveBeenCalledTimes(1)
            MockUniStack.installNPMDependencies = () => Promise.resolve()
            done()
        })
    })
    it ('should throw async errors if something went wrong', (done) => {
        const error = new Error('fatal')
        const promiseError = () => Promise.resolve().then(() => { throw error })
        let errors = 4
        // mock error function
        MockUniStack.handleError = e => {
            expect(e).toBe(error)
            if (--errors === 0) {
                done()
            }
        }
        MockUniStack.askSetupQuestions = promiseError
        Promise.resolve()
        .then(() => MockUniStack.initInteractiveSetup(baseCommand))
        .then(() => {
            MockUniStack.askSetupQuestions = () => Promise.resolve()
            MockUniStack.processSetupAnswers = promiseError
            return Promise.resolve()
        })
        .then(() => MockUniStack.initInteractiveSetup(baseCommand))
        .then(() => {
            MockUniStack.processSetupAnswers = () => Promise.resolve()
            MockUniStack.installJSPMDependencies = promiseError
            return Promise.resolve()
        })
        .then(() => MockUniStack.initInteractiveSetup(baseCommand))
        .then(() => {
            MockUniStack.installJSPMDependencies = () => Promise.resolve()
            MockUniStack.installNPMDependencies = promiseError
            return Promise.resolve()
        })
        .then(() => MockUniStack.initInteractiveSetup(baseCommand))
        .catch(e => console.log(e.stack)) // to catch errors from top level blocks
    })
})

describe ('UniStack copyBaseDirectoriesToProject()', () => {
    const unistack = Path.join(__dirname, '../../')
    const testEnviroment = Config.environment.directory
    const tmpTestEnvironmentRename = Path.join(unistack, 'tmp/environment')
    beforeEach(() => {
        // setup a clean enviroment
        Fs.renameSync(testEnviroment, tmpTestEnvironmentRename)
        Fs.ensureDirSync(testEnviroment)
        UniStack.validateInstallationDirectory()
    })
    afterEach(() => {
        // put things back as they were
        Fs.removeSync(testEnviroment)
        Fs.renameSync(tmpTestEnvironmentRename, testEnviroment)
    })
    it ('should copy base directories and files to project directory.', () => {
        UniStack.copyBaseDirectoriesToProject()
        const rootPath = Config.environment.directory
        const filenames = [
            Path.join(rootPath, 'src/client/index.js'),
            Path.join(rootPath, 'src/client/css/preprocessor/production.js'),
            Path.join(rootPath, 'src/client/css/preprocessor/development.js'),
            Path.join(rootPath, 'src/client/test/specs/index.js'),
            Path.join(rootPath, 'src/server/components/layout.js'),
            Path.join(rootPath, 'src/server/test/specs/index.js'),
            Path.join(rootPath, 'src/server/index.js'),
            Path.join(rootPath, 'src/shared/routes.js'),
            Path.join(rootPath, 'src/shared/actions/index.js'),
            Path.join(rootPath, 'src/shared/components/404.js'),
            Path.join(rootPath, 'src/shared/components/App.js'),
            Path.join(rootPath, 'src/shared/components/HelloWorld.js'),
            Path.join(rootPath, 'src/shared/containers/index.js'),
            Path.join(rootPath, 'src/shared/reducers/index.js')
        ]
        filenames.forEach(filename => {
            //console.log('filename', filename)
            expect(() => Fs.lstatSync(filename)).not.toThrowError()
        })
    })
})

describe ('UniStack destroyProject()', () => {
    const unistack = Path.join(__dirname, '../../')
    const testEnviroment = Config.environment.directory
    const tmpTestEnvironmentRename = Path.join(unistack, 'tmp/environment')
    beforeEach(() => {
        // setup a clean enviroment
        Fs.renameSync(testEnviroment, tmpTestEnvironmentRename)
        Fs.ensureDirSync(testEnviroment)
        UniStack.validateInstallationDirectory()
        UniStack.copyBaseDirectoriesToProject()
    })
    afterEach(() => {
        // put things back as they were
        Fs.removeSync(testEnviroment)
        Fs.renameSync(tmpTestEnvironmentRename, testEnviroment)
    })
    it ('should empty entire app directory.', () => {
        UniStack.destroyProject()
        expect(Fs.readdirSync(testEnviroment).length).toBe(0)
    })
})

describe ('UniStack.setupPackageJSON()', () => {
    it ('should copy package.json file to environment directory', () => {
        UniStack.setupPackageJSON()
        const packageJSON = Path.join(Config.environment.directory, 'package.json')
        expect(() => Fs.lstatSync(packageJSON)).not.toThrowError()
        Fs.removeSync(packageJSON)
    })
    it ('should copy package.json file to environment directory', () => {
        UniStack.setupPackageJSON()
        const packageJSON = Path.join(Config.environment.directory, 'package.json')
        const packageJSONObj = require(packageJSON)
        const jspm = packageJSONObj.jspm
        expect(jspm.configFiles.jspm)
        .toBe('node_modules/unistack/bootstrap/jspm.config.js')
        expect(jspm.directories.packages)
        .toBe('node_modules/unistack/bootstrap/jspm_packages')
        Fs.removeSync(packageJSON)
    })
})

if (!process.env.QUICK_TEST_RUN) {

    describe ('UniStack installNPMDependencies()', () => {
        const unistack = Path.join(__dirname, '../../')
        const testEnviroment = Config.environment.directory
        const tmpTestEnvironmentRename = Path.join(unistack, 'tmp/environment')
        let originalTimeout
        beforeEach(() => {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 240000
            // setup a clean enviroment
            Fs.renameSync(testEnviroment, tmpTestEnvironmentRename)
            Fs.ensureDirSync(testEnviroment)
            UniStack.validateInstallationDirectory()
            UniStack.setupPackageJSON()
        })
        afterEach(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
            // put things back as they were
            Fs.removeSync(testEnviroment)
            Fs.renameSync(tmpTestEnvironmentRename, testEnviroment)
        })
        it ('should install npm dependencies', (done) => {
            console.log('Installing test environment NPM dependencies!')
            UniStack.installNPMDependencies()
            .then(passed => {
                const packages = Path.join(testEnviroment, 'node_modules')
                expect(passed).toBe(true)
                expect(() => Fs.lstatSync(packages)).not.toThrowError()
                expect(Fs.readdirSync(packages).length).toBeGreaterThan(0)
                done()
            })
            .catch(e => console.log(e.stack)) // catch errors in previous block
        })
        it ('should throw errors if something went wrong', (done) => {
            const MockUniStack = Object.assign({}, UniStack)
            MockUniStack.installNPMDependencies('npm invalid install')
            .catch(e => {
                expect(e instanceof Error).toBe(true)
                done()
            }) // catch errors in previous block
        })
    })
}
describe ('UniStack installJSPMDependencies()', () => {
    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 240000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should install jspm dependencies.', (done) => {

        // ############################ ATTENTION ############################
            // This it block has to remain as the first spec on this block.
            // This is, in part, do to the programatic jspm.install(true)
            // being a one time deal per process, and also helps with
            // performance, as jspm.install(true) takes time and there
            // is no benefit in running jspm.install(true) multiple times.
        // ############################ ATTENTION ############################

        console.log('Installing test environment JSPM dependencies!')
        const unistack = Path.join(__dirname, '../../')
        const environment = Path.join(unistack, '/test/environment')
        const bootstrap = Path.join(environment, '/node_modules/unistack/bootstrap')
        UniStack.setupPackageJSON()
        UniStack.installJSPMDependencies()
        .then(() => {
            const packages = Path.join(bootstrap, 'jspm_packages')
            expect(() => Fs.lstatSync(Path.join(packages, 'npm')))
            .not.toThrowError()
            expect(() => Fs.lstatSync(Path.join(packages, 'github')))
            .not.toThrowError()
            expect(() => Fs.lstatSync(Path.join(packages, 'system.js')))
            .not.toThrowError()
            expect(() => Fs.lstatSync(Path.join(packages, 'system.src.js')))
            .not.toThrowError()
            expect(() => Fs.lstatSync(Path.join(packages, 'system.js.map')))
            .not.toThrowError()
            expect(() => Fs.lstatSync(Path.join(packages, 'system-polyfills.js')))
            .not.toThrowError()
            expect(() => Fs.lstatSync(Path.join(packages, 'system-polyfills.src.js')))
            .not.toThrowError()
            expect(() => Fs.lstatSync(Path.join(packages, 'system-polyfills.js.map')))
            .not.toThrowError()
            done()
        }).catch(e => { console.log(e.stack) }) // catch errors in previous block
    })
})

describe ('UniStack getSystemConstant()', () => {
    const environmentPath = Config.environment.directory
    const unistackPath = Path.join(environmentPath, 'node_modules', 'unistack')
    it ('should return an object with an environment path property', () => {
        expect(UniStack.getSystemConstant())
        .toEqual(jasmine.objectContaining({ environmentPath }))
    })
    it ('should return an object with an unistack path property', () => {
        expect(UniStack.getSystemConstant())
        .toEqual(jasmine.objectContaining({ unistackPath }))
    })
    it ('should return an immutable object', () => {
        const system = UniStack.getSystemConstant()
        const unistackPath = system.unistackPath
        expect(() => system.unistackPath = 'something else')
        .toThrowError(TypeError)
    })
    it ('should return an non-extendable object', () => {
        const system = UniStack.getSystemConstant()
        expect(() => system.hello = 'world')
        .toThrowError(TypeError)
    })
})

describe ('UniStack bundle()', () => {
    const basePath = Config.environment.directory

    const MockUniStack = Object.assign({}, UniStack)
    MockUniStack.system = MockUniStack.getSystemConstant()

    const bootstrapPath = Path.join(MockUniStack.system.unistackPath, 'bootstrap')
    const entryFile = Path.join(bootstrapPath, 'server', 'index.js')
    const outputFile = Path.join(bootstrapPath, 'server', 'bundle.js')

    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should assert that entry and output path arguments are required', () => {
        expect(() => MockUniStack.bundle()).toThrowError()
        expect(() => MockUniStack.bundle({ entryFile }))
        .toThrowError('Entry and output paths are required.')
        expect(() => MockUniStack.bundle({ outputFile }))
        .toThrowError('Entry and output paths are required.')
        expect(() => MockUniStack.bundle({ entryFile, outputFile }))
        .not.toThrowError()
    })
    it ('should return an bundler object with a build method', () => {
        expect(MockUniStack.bundle({ entryFile, outputFile }).build)
        .toEqual(jasmine.any(Function))
    })
})

describe ('UniStack bundleForNode()', () => {
    const MockUniStack = Object.assign({}, UniStack)
    MockUniStack.system = MockUniStack.getSystemConstant()

    const basePath = Config.environment.directory
    const unistackPath = MockUniStack.system.unistackPath
    const environmentPath = MockUniStack.system.environmentPath
    const bootstrapPath = Path.join(unistackPath, 'bootstrap')

    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should return stats about the bundle and the bundle instance', (done) => {
        const stats = {
            sfx: true,
            node: true,
            production: true,
            sourceMaps: true
        }
        MockUniStack.bundleForNode(true).then(bundle => {
            const bundleInstance = bundle.instance
            delete bundle.instance
            expect(bundle).toEqual(stats)
            expect(bundleInstance.build).toEqual(jasmine.any(Function))
            done()
        })
        .catch(e => console.error(e.stack))
    })
    it ('should build a node development bundle', (done) => {
        const outputFile = Path.join(bootstrapPath, 'server', 'server.bundle.js')
        MockUniStack.bundleForNode().then(stats => {
            expect(() => Fs.lstatSync(outputFile)).not.toThrowError()
            const response = require(outputFile).default
            expect(response.environment).toBe('development')
            response.server.close(() => {
                delete require.cache[outputFile]
                Fs.removeSync(outputFile)
                Fs.removeSync(outputFile + '.map')
                done()
            })
        })
        .catch(e => console.error(e.stack))
    })
    it ('should build a node production bundle', (done) => {
        const outputFile = Path.join(environmentPath, 'dist', 'server.bundle.js')
        MockUniStack.bundleForNode(true).then(stats => {
            expect(() => Fs.lstatSync(outputFile)).not.toThrowError()
            const response = require(outputFile).default
            expect(response.environment).toBe('production')
            response.server.close(() => {
                delete require.cache[outputFile]
                Fs.removeSync(outputFile)
                Fs.removeSync(outputFile + '.map')
                done()
            })
        })
        .catch(e => console.error(e.stack))
    })
})

describe ('UniStack bundleForBrowser()', () => {
    const MockUniStack = Object.assign({}, UniStack)
    MockUniStack.system = MockUniStack.getSystemConstant()

    const basePath = Config.environment.directory
    const environmentPath = MockUniStack.system.environmentPath

    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should return stats about the bundle and the bundle instance', (done) => {
        const stats = {
            sourceMaps: true
        }
        MockUniStack.bundleForBrowser().then(bundle => {
            const bundleInstance = bundle.instance
            delete bundle.instance
            expect(bundle).toEqual(stats)
            expect(bundleInstance.build).toEqual(jasmine.any(Function))
            done()
        })
        .catch(e => console.error(e.stack))
    })
    it ('should build a browser bundle', (done) => {
        const outputFile = Path.join(environmentPath, 'dist', 'client.bundle.js')
        MockUniStack.bundleForBrowser().then(bundler => {
            expect(() => Fs.lstatSync(outputFile)).not.toThrowError()
            Fs.removeSync(outputFile)
            Fs.removeSync(outputFile + '.map')
            done()
        })
        .catch(e => console.error(e.stack))
    })
})

describe ('UniStack getFileWatchOptions()', () => {
    const MockUniStack = Object.assign({}, UniStack)
    MockUniStack.system = MockUniStack.getSystemConstant()
    const srcPath = Path.join(MockUniStack.system.environmentPath, 'src')
    const bootstrapPath = Path.join(MockUniStack.system.unistackPath, 'bootstrap')
    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should return a callback that triggers a new bundle build', (done) => {
        const bundleMock = { instance: { build: done } }
        const watchOptions = MockUniStack.getFileWatchOptions(bundleMock)
        watchOptions.callback()
    })
    it ('should return a callback that destroys the environment server', (done) => {
        MockUniStack.environmentServer = { close: done }
        const bundleMock = { node: true, instance: { build: () => {} } }
        const watchOptions = MockUniStack.getFileWatchOptions(bundleMock)
        watchOptions.callback()
    })
    it ('should return patterns for server files', () => {
        const bundleMock = { node: true }
        const watchOptions = MockUniStack.getFileWatchOptions(bundleMock)
        expect(watchOptions.patterns).toEqual([
            Path.join(srcPath, '{shared/*,shared/**}.js'),
            Path.join(srcPath, `{server/*,server/!(test)/**}.js`),
            Path.join(bootstrapPath, `{server/!(server.bundle),server/!(test)/**}.js`)
        ])
    })
    it ('should return patterns for client files', () => {
        const bundleMock = {}
        const watchOptions = MockUniStack.getFileWatchOptions(bundleMock)
        expect(watchOptions.patterns).toEqual([
            Path.join(srcPath, '{shared/*,shared/**}.js'),
            Path.join(srcPath, `{client/*,client/!(test)/**}.js`),
            Path.join(bootstrapPath, `{client/!(client.bundle),client/!(test)/**}.js`)
        ])
    })
})

describe ('UniStack initSocket()', () => {
    it ('should return server and io instances', (done) => {
        UniStack.initReloader()
        .then(response => {
            expect(typeof response.server).toBe('object')
            expect(typeof response.io).toBe('object')
            response.server.destroy(done)
        })
        .catch(e => console.error(e.stack))
    })
    it ('should start server with the config defined port', (done) => {
        UniStack.initReloader()
        .then(response => {
            const server = response.server
            expect(server.address().port).toBe(Config.server.reloaderPort)
            server.destroy(done)
        })
        .catch(e => console.error(e.stack))
    })
})

describe ('UniStack watchFiles()', () => {
    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should return and fulfil a promise', (done) => {
        const options = {
            patterns: Path.join(__dirname, '..', 'mocks', 'file-watch-test.js'),
            callback: () => {}
        }
        UniStack.watchFiles(options).then(gaze => {
            gaze.close()
            done()
        })
        .catch(e => console.error(e.stack))
    })
    it ('should call callback when file changes', (done) => {
        const testPath = Path.join(__dirname, '..')
        const tmpPath = Path.join(testPath, '..')
        const tmpFile = Path.join(tmpPath, 'test', 'file-watch-test.js')
        let globalGaze
        const options = {
            patterns: tmpFile,
            callback: filename => {
                expect(filename).toBe(tmpFile)
                Fs.removeSync(tmpFile)
                globalGaze.close()
                done()
            }
        }
        Fs.copySync(Path.join(testPath, 'mocks', 'file-watch-test.js'), tmpFile)
        UniStack.watchFiles(options).then(gaze => {
            globalGaze = gaze
            Fs.appendFileSync(tmpFile, 'Hello World')
        })
        .catch(e => console.error(e.stack))
    })
    it ('should emit a "change" event to the client', (done) => {
        const testPath = Path.join(__dirname, '..')
        const tmpPath = Path.join(testPath, '..')
        const tmpFile = Path.join(tmpPath, 'test', 'file-watch-test.js')
        Fs.copySync(Path.join(testPath, 'mocks', 'file-watch-test.js'), tmpFile)
        const options = {
            patterns: tmpFile,
            callback: () => {}
        }
        let globalGaze, clientSocket
        UniStack.initReloader()
        .then(response => {
            return new Promise((resolve, reject) => {
                response.io.on('connection', socket => {
                    resolve()
                })
                const host = 'http://localhost:' + Config.server.reloaderPort
                clientSocket = IOClient.connect(host, {
                    'reconnection delay' : 0,
                    'reopen delay' : 0,
                    'force new connection' : true
                })
                clientSocket.once('change', filename => {
                    expect(filename).toBe(tmpFile)
                    Fs.removeSync(tmpFile)
                    globalGaze.close()
                    response.server.destroy(done)
                })
            })
        })
        .then(UniStack.watchFiles.bind(UniStack, options))
        .then(gaze => {
            globalGaze = gaze
            Fs.appendFileSync(tmpFile, 'Hello World')
        })
        .catch(e => console.error(e.stack))
    })
})

describe ('UniStack runNodeBundle()', () => {
    const MockUniStack = Object.assign({}, UniStack)
    MockUniStack.system = MockUniStack.getSystemConstant()

    const bootstrapPath = Path.join(MockUniStack.system.unistackPath, 'bootstrap')

    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should require the node bundle', (done) => {
        const outputFile = Path.join(bootstrapPath, 'server', 'server.bundle.js')
        MockUniStack.bundleForNode()
        .then(MockUniStack.runNodeBundle.bind(MockUniStack))
        .then(response => {
            response.server.close(() => {
                delete require.cache[outputFile]
                Fs.removeSync(outputFile)
                Fs.removeSync(outputFile + '.map')
                done()
            })
        })
        .catch(e => console.error(e.stack))
    })
})

describe ('UniStack initDevEnvironment()', () => {
    const MockUniStack = Object.assign({}, UniStack)
    MockUniStack.initReloader = () => Promise.resolve()
    MockUniStack.bundleForNode = () => Promise.resolve()
    MockUniStack.bundleForBrowser = () => Promise.resolve()
    MockUniStack.getFileWatchOptions = () => Promise.resolve()
    MockUniStack.watchFiles = () => Promise.resolve()
    MockUniStack.runNodeBundle = () => Promise.resolve()
    it ('should return a promise', (done) => {
        const promise = MockUniStack.initDevEnvironment()
        expect(typeof promise.then).toBe('function')
        promise.then(done)
    })
    it ('should initialize reloader', (done) => {
        spyOn(MockUniStack, 'initReloader')
        MockUniStack.initDevEnvironment().then(() => {
            expect(MockUniStack.initReloader).toHaveBeenCalledTimes(1)
            done()
        })
        .catch(e => console.log(e.stack))
    })
    it ('should create a bundle for the node environment', (done) => {
        spyOn(MockUniStack, 'bundleForNode')
        MockUniStack.initDevEnvironment().then(() => {
            expect(MockUniStack.bundleForNode).toHaveBeenCalledTimes(1)
            done()
        })
        .catch(e => console.log(e.stack))
    })
    it ('should create a bundle for the browser environment', (done) => {
        spyOn(MockUniStack, 'bundleForBrowser')
        MockUniStack.initDevEnvironment().then(() => {
            expect(MockUniStack.bundleForBrowser).toHaveBeenCalledTimes(1)
            done()
        })
        .catch(e => console.log(e.stack))
    })
    it ('should return correct configuration for watching files', (done) => {
        spyOn(MockUniStack, 'getFileWatchOptions')
        MockUniStack.initDevEnvironment().then(() => {
            expect(MockUniStack.getFileWatchOptions).toHaveBeenCalledTimes(2)
            done()
        })
        .catch(e => console.log(e.stack))
    })
    it ('should watch relevant bundle files for changes', (done) => {
        spyOn(MockUniStack, 'watchFiles')
        MockUniStack.initDevEnvironment().then(() => {
            expect(MockUniStack.watchFiles).toHaveBeenCalledTimes(2)
            done()
        })
        .catch(e => console.log(e.stack))
    })
    it ('should require node bundle', (done) => {
        spyOn(MockUniStack, 'runNodeBundle')
        MockUniStack.initDevEnvironment().then(() => {
            expect(MockUniStack.runNodeBundle).toHaveBeenCalledTimes(1)
            done()
        })
        .catch(e => console.log(e.stack))
    })
})
