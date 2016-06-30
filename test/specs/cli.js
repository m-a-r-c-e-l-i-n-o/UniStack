import Fs from 'fs-extra'
import Path from 'path'
import CLI from '../../src/cli.js'
import AppConfig from '../../app.config.js'
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

describe ('CLI', () => {
    it ('should be a function.', () => {
        expect(typeof CLI).toBe('object')
    })
})

describe ('CLI constructor()', () => {
    it ('should start dev enviroment if no flags are present', () => {
        spyOn(CLI, 'startDevEnviroment')
        CLI.constructor(baseCommand)
        expect(CLI.startDevEnviroment).toHaveBeenCalledTimes(1)
    })
    it ('should initiate setup if "setup" flag is present', () => {
        spyOn(CLI, 'initInteractiveSetup')
        CLI.constructor(setupCommand)
        expect(CLI.initInteractiveSetup).toHaveBeenCalledTimes(1)
    })
})

describe ('CLI resolveConfig()', () => {
    it ('should default to an empty object when config is not a string or object', () => {
        expect(CLI.resolveConfig()).toEqual({})
    })
    it ('should return object when an object is passed in', () => {
        const config = {}
        expect(CLI.resolveConfig(config)).toBe(config)
    })
    it ('should resolve a config filename', () => {
        const filename = 'unistack.config.js'
        const configFilename = Path.join(AppConfig.base.directory, filename)
        Fs.writeFileSync(configFilename, basicConfig)
        expect(CLI.resolveConfig(filename))
        .toEqual({
            hello: 'from mocked unistack.config.js'
        })
        Fs.unlinkSync(configFilename)
    })
    it ('should throw error when file is not found', () => {
        const filename = 'unistack.config.js'
        const configFilename = Path.join(AppConfig.base.directory, filename)
        delete require.cache[configFilename]
        expect(() => CLI.resolveConfig(filename))
        .toThrowError(
            AppConfig.errors.invalidConfigPath
            .replace('{{filename}}', configFilename)
        )
    })
})

describe ('CLI parseArguments()', () => {
    it ('should return a false properties when only base arguments are present', () => {
        CLI.parseArguments(baseCommand, true)
        expect(CLI.parseArguments(baseCommand, true)).toEqual({
            setup: undefined
        })
    })
    it ('should return an object with a truthy "setup" property when "--setup" is present', () => {
        expect(CLI.parseArguments(setupCommand)).toEqual(jasmine.objectContaining({
            setup: true
        }))
    })
    it ('should return an object with falsy arguments when arguments are invalid', () => {
        CLI.parseArguments()
        expect(CLI.parseArguments()).toEqual({
            setup: undefined
        })
    })
})

describe ('CLI handleError()', () => {
    it ('should catch errors when first parameter is passed', () => {
        expect(() => CLI.handleError(new Error('Fatal!')))
        .toThrowError('Fatal!')
    })
    it ('should catch warnings when second parameter is passed', () => {
        const consoleWarn = console.warn
        console.warn = function (message) {
           expect(message.startsWith('Warning!')).toBeTruthy()
        }
        CLI.handleError(new Error('Warning!'), true)
        console.warn = consoleWarn
    })
    it ('should not throw error when second parameter is passed', () => {
        const consoleWarn = console.warn
        console.warn = () => {}
        expect(() => CLI.handleError(new Error('Warning!'), true))
        .not.toThrowError('Warning!')
        console.warn = consoleWarn
    })
    it ('should throw error with no stack when third parameter is passed', () => {
        expect(() => CLI.handleError(new Error('Fatal!'), true, true))
        .toThrowError('Fatal!')
        try {
            CLI.handleError(new Error('Fatal!'), true, true)
        } catch(e) {
            expect(e.stack).toBe('')
        }
    })
})

describe ('CLI validateReservedDirectories()', () => {
    it ('should throw error when one or more reserved directories are present', () => {
        Fs.copySync('/home/marcbraulio/Projects/unistack/base', AppConfig.base.directory)
        const directories = `"${AppConfig.base.directories.join('", "')}"`
        expect(() => CLI.validateReservedDirectories())
        .toThrowError(
            AppConfig.errors.occupiedDirectories.replace(
                '{{directories}}',
                directories
            )
        )
        Fs.removeSync(Path.join(AppConfig.base.directory, 'src'))
        Fs.removeSync(Path.join(AppConfig.base.directory, 'dist'))
    })
})

describe ('CLI validatePackageJSON()', () => {
    it ('should throw error if "package.json" file is not present in the cwd', () => {
        expect(() => CLI.validatePackageJSON())
        .toThrowError(
            AppConfig.errors.invalidPackageJSON
        )
    })
    it ('should silence if "package.json" file is present in the cwd', () => {
        const filename = Path.join(AppConfig.base.directory, 'package.json')
        Fs.writeFileSync(filename, basicPackageJSON)
        expect(() => CLI.validatePackageJSON()).not.toThrowError()
        Fs.removeSync(filename)
    })
})

describe ('CLI askSetupQuestions()', () => {
    it ('should return a promise', function () {
        const questions = CLI.setupQuestions
        CLI.setupQuestions = []
        const prompt = CLI.askSetupQuestions()
        expect(typeof prompt.then).toBe('function')
        prompt.then(answers => done())
        CLI.setupQuestions = questions
    })
    it ('should prompt user for the project name', (done) => {
        BDDStdin('unistack\n')
        const prompt = CLI.askSetupQuestions()
        prompt.then(answers => {
            expect(answers.projectName).toBe('unistack')
            done()
        })
    })
})

describe ('CLI initInteractiveSetup()', () => {
    beforeEach(() => {
        CLI.validateReservedDirectories = ((original) => {
            return (restore) => {
                if (restore) {
                    CLI.validateReservedDirectories = original
                }
            }
        })(CLI.validateReservedDirectories)
        CLI.validatePackageJSON = ((original) => {
            return (restore) => {
                if (restore) {
                    CLI.validatePackageJSON = original
                }
            }
        })(CLI.validatePackageJSON)
        CLI.copyBaseDirectoriesToProject = ((original) => {
            return (restore) => {
                if (restore) {
                    CLI.copyBaseDirectoriesToProject = original
                }
            }
        })(CLI.copyBaseDirectoriesToProject)
    })
    afterEach(() => {
        CLI.validateReservedDirectories(true)
        CLI.validatePackageJSON(true)
        CLI.copyBaseDirectoriesToProject(true)
    })
    it ('should validate that reserved directories are not present.', () => {
        spyOn(CLI, 'validateReservedDirectories').and.callThrough()
        CLI.initInteractiveSetup(baseCommand)
        expect(CLI.validateReservedDirectories).toHaveBeenCalledTimes(1)
    })
    it ('should validate that a "package.json" file is present in the cwd.', () => {
        spyOn(CLI, 'validatePackageJSON').and.callThrough()
        CLI.initInteractiveSetup(baseCommand)
        expect(CLI.validatePackageJSON).toHaveBeenCalledTimes(1)
    })
    it ('should copy base directories to project directory.', () => {
        spyOn(CLI, 'copyBaseDirectoriesToProject').and.callThrough()
        CLI.initInteractiveSetup(baseCommand)
        expect(CLI.copyBaseDirectoriesToProject).toHaveBeenCalledTimes(1)
        Fs.removeSync(Path.join(AppConfig.base.directory, 'src'))
        Fs.removeSync(Path.join(AppConfig.base.directory, 'dist'))
    })
})

describe ('CLI copyBaseDirectoriesToProject()', () => {
    it ('should copy base directories and files to project directory.', () => {
        CLI.copyBaseDirectoriesToProject(true)
        CLI.copyBaseDirectoriesToProject()
        // app/src
        const src = Path.join(AppConfig.base.directory, 'src')
        expect(() => Fs.lstatSync(src)).not.toThrowError()
        // app/src/client
        const client = Path.join(src, 'client')
        expect(() => Fs.lstatSync(client)).not.toThrowError()
        // app/src/client/css
        const clientCss = Path.join(client, 'css')
        expect(() => Fs.lstatSync(clientCss)).not.toThrowError()
        // app/src/client/css/preprocessor.js
        const clientCssPreprocessorJS = Path.join(clientCss, 'preprocessor.js')
        expect(() => Fs.lstatSync(clientCssPreprocessorJS)).not.toThrowError()
        // app/src/client/test
        const clientTest = Path.join(client, 'test')
        expect(() => Fs.lstatSync(clientTest)).not.toThrowError()
        // app/src/client/test/coverage
        const clientTestCoverage = Path.join(clientTest, 'coverage')
        expect(() => Fs.lstatSync(clientTestCoverage)).not.toThrowError()
        // app/src/client/test/specs
        const clientTestSpecs = Path.join(clientTest, 'specs')
        expect(() => Fs.lstatSync(clientTestSpecs)).not.toThrowError()
        // app/src/server
        const server = Path.join(src, 'server')
        expect(() => Fs.lstatSync(server)).not.toThrowError()
        // app/src/server/test
        const serverTest = Path.join(server, 'test')
        expect(() => Fs.lstatSync(serverTest)).not.toThrowError()
        // app/src/server/test/coverage
        const serverTestCoverage = Path.join(serverTest, 'coverage')
        expect(() => Fs.lstatSync(serverTestCoverage)).not.toThrowError()
        // app/src/server/test/specs
        const serverTestSpecs = Path.join(serverTest, 'specs')
        expect(() => Fs.lstatSync(serverTestSpecs)).not.toThrowError()
        // app/src/shared
        const shared = Path.join(src, 'shared')
        expect(() => Fs.lstatSync(shared)).not.toThrowError()
        // app/src/shared/actions
        const sharedActions = Path.join(shared, 'actions')
        expect(() => Fs.lstatSync(sharedActions)).not.toThrowError()
        // app/src/shared/components
        const sharedComponents = Path.join(shared, 'components')
        expect(() => Fs.lstatSync(sharedComponents)).not.toThrowError()
        // app/src/shared/containers
        const sharedContainers = Path.join(shared, 'containers')
        expect(() => Fs.lstatSync(sharedContainers)).not.toThrowError()
        // app/src/shared/reducers
        const sharedReducers = Path.join(shared, 'reducers')
        expect(() => Fs.lstatSync(sharedReducers)).not.toThrowError()
        // app/src/shared/routes.js
        const sharedRoutesJS = Path.join(shared, 'routes.js')
        expect(() => Fs.lstatSync(sharedRoutesJS)).not.toThrowError()
        // app/dist
        const dist = Path.join(AppConfig.base.directory, 'dist')
        expect(() => Fs.lstatSync(dist)).not.toThrowError()
        Fs.removeSync(Path.join(AppConfig.base.directory, 'src'))
        Fs.removeSync(Path.join(AppConfig.base.directory, 'dist'))
    })
})

describe ('CLI getProjectName()', () => {
    it ('should return the project directory name when "package.json" is not found.', () => {
        expect(CLI.getProjectName()).toBe('app')
    })
    it ('should return the project name "package.json" when possible', () => {
        const packageJSON = Path.join(AppConfig.base.directory, 'package.json')
        Fs.writeFileSync(packageJSON, basicPackageJSON)
        expect(CLI.getProjectName()).toBe('basic-app')
        Fs.removeSync(packageJSON)
    })
})
