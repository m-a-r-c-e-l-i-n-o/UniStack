import Fs from 'fs-extra'
import Path from 'path'
import UniStack from '../../src/unistack.js'
import Config from '../../config.js'
import BDDStdin from '../lib/bdd-stdin.js'

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
    UniStackMock.startDevEnvironment = () => {}
    UniStackMock.initInteractiveSetup = () => {}
    it ('should start dev enviroment if no flags are present', () => {
        spyOn(UniStackMock, 'startDevEnvironment')
        UniStackMock.constructor(baseCommand)
        expect(UniStackMock.startDevEnvironment).toHaveBeenCalledTimes(1)
    })
    it ('should initiate setup if "setup" flag is present', () => {
        spyOn(UniStackMock, 'initInteractiveSetup')
        UniStackMock.constructor(setupCommand)
        expect(UniStackMock.initInteractiveSetup).toHaveBeenCalledTimes(1)
    })
    it ('should throw fatal errors', () => {
        const error = new Error('Fatal')
        UniStackMock.startDevEnvironment = () => {
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
    it ('should return a promise', function () {
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

describe ('UniStack initInteractiveSetup()', () => {
    const MockUniStack = Object.assign({}, UniStack)
    MockUniStack.validateInstallationDirectory = () => {}
    MockUniStack.setupPackageJSON = () => {}
    MockUniStack.copyBaseDirectoriesToProject = () => {}
    MockUniStack.askSetupQuestions = () => Promise.resolve()
    MockUniStack.processSetupAnswers = () => Promise.resolve()
    MockUniStack.installJSPMDependencies = () => Promise.resolve()
    MockUniStack.installNPMDependencies = () => Promise.resolve()
    it ('should return a promise', function () {
        const promise = MockUniStack.askSetupQuestions()
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
    it ('should ask setup questions.', () => {
        spyOn(MockUniStack, 'askSetupQuestions')
        MockUniStack.initInteractiveSetup(baseCommand)
        .then(() => {
            expect(MockUniStack.askSetupQuestions).toHaveBeenCalledTimes(1)
        })
    })
    it ('should process setup answers.', () => {
        spyOn(MockUniStack, 'processSetupAnswers')
        MockUniStack.initInteractiveSetup(baseCommand)
        .then(() => {
            expect(MockUniStack.processSetupAnswers).toHaveBeenCalledTimes(1)
        })
    })
    it ('should install jspm dependencies.', () => {
        spyOn(MockUniStack, 'installJSPMDependencies')
        MockUniStack.initInteractiveSetup(baseCommand)
        .then(() => {
            expect(MockUniStack.installJSPMDependencies).toHaveBeenCalledTimes(1)
        })
    })
    it ('should install npm dependencies.', () => {
        spyOn(MockUniStack, 'installNPMDependencies')
        MockUniStack.initInteractiveSetup(baseCommand)
        .then(() => {
            expect(MockUniStack.installNPMDependencies).toHaveBeenCalledTimes(1)
        })
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
        // mock error function
        MockUniStack.handleError = e => {
            expect(e instanceof Error).toBe(true)
            done()
        }
        MockUniStack.installNPMDependencies('npm invalid install')
        .catch(e => console.log(e.stack)) // catch errors in previous block
    })
})

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

