'use strict'
import Fs from 'fs-extra'
import Path from 'path'
import _ from 'lodash'
import Inquirer from 'inquirer'
import Config from '../config.js'
import Argv from 'argv'
import ChildProcess from 'child_process'
import Bundler from 'jspm-dev-builder'

const UniStack = {
    setupQuestions: [{
            type: 'input',
            name: 'project_name',
            message: 'What\'s the name of your project?',
            default: () => Path.basename(Config.environment.directory)
        }
    ],
    constructor(processArgs) {
        try {
            const args = this.parseArguments(processArgs)
            this.system = this.getSystemConstant()
            if (args.setup) {
                this.initInteractiveSetup()
            } else {
                this.startDevEnvironment(
                    this.resolveConfig(args.config)
                )
            }
        } catch (e) {
            this.handleError(e)
        }
    },
    getSystemConstant() {
        const basePath = Config.environment.directory
        return Object.freeze({
            environmentPath: basePath,
            unistackPath: Path.join(basePath, 'node_modules', 'unistack')
        })
    },
    resolveConfig(filename) {
        if (!filename) {
            filename = {}
        }
        if (_.isObject(filename)) {
            return filename
        }
        let configWrapper
        const configFilename = Path.join(Config.environment.directory, filename)
        try {
            configWrapper = require(configFilename)
        } catch (e) {
            throw new Error(
                Config.errors.invalidConfigPath
                .replace('{{filename}}', configFilename)
            )
        }
        const config = Object.seal({
            options: null,
            set: function (opts) {
               this.options = opts
            }
        })
        configWrapper(config)
        return config.options
    },
    validateInstallationDirectory() {
        if (Fs.readdirSync(Config.environment.directory).length > 0) {
            throw new Error(Config.errors.installationDirectoryIsPopulated)
        }
    },
    copyBaseDirectoriesToProject() {
        Fs.copySync(
            Path.join(__dirname, '../environment'),
            Config.environment.directory
        )
    },
    installNPMDependencies(testCommand) {
        const command = testCommand || "npm install"
        const options = {
            cwd: Config.environment.directory
        }
        return new Promise((resolve, reject) => {
            ChildProcess.exec(command, options, (error, stdout, stderr) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(true)
                }
            })
        })
    },
    installJSPMDependencies() {
        const jspm = require('jspm')
        jspm.setPackagePath(Config.environment.directory)
        return Promise
        .resolve()
        .then(jspm.dlLoader)
        .then(() => jspm.install(true))
    },
    askSetupQuestions() {
        return Inquirer.prompt(this.setupQuestions)
    },
    processSetupAnswers(answers) {
        return Promise.resolve()
    },
    setupPackageJSON() {
        const bootstrap = Path.join(__dirname, '../bootstrap')
        const packageJSON = Path.join(bootstrap, 'package.json')
        const packageJSONObj = require(packageJSON)
        const jspm = packageJSONObj.jspm
        const jspmConfigFiles = jspm.configFiles
        const jspmDirectories = jspm.directories
        jspmConfigFiles.jspm = 'node_modules/unistack/bootstrap/jspm.config.js'
        jspmDirectories.packages = 'node_modules/unistack/bootstrap/jspm_packages'
        Fs.writeFileSync(
            Path.join(Config.environment.directory, 'package.json'),
            JSON.stringify(packageJSONObj, null, '\t')
        )
    },
    initSetup() {
        this.validateInstallationDirectory()
        this.setupPackageJSON()
        this.copyBaseDirectoriesToProject()
        return Promise.resolve()
            .then(this.installNPMDependencies.bind(this))
            .then(this.installJSPMDependencies.bind(this))
            .catch(e => this.handleError(e, false, this.throwAsyncError))
    },
    initInteractiveSetup() {
        this.validateInstallationDirectory()
        this.setupPackageJSON()
        this.copyBaseDirectoriesToProject()
        return Promise.resolve({})
            .then(this.askSetupQuestions.bind(this))
            .then(this.processSetupAnswers)
            .then(this.installJSPMDependencies.bind(this))
            .then(this.installNPMDependencies.bind(this))
            .catch(e => this.handleError(e, false, this.throwAsyncError))
    },
    destroyProject() {
        Fs.emptyDirSync(Config.environment.directory)
    },
    parseArguments(processArgs) {
        if (!Array.isArray(processArgs)) {
            processArgs = []
        }
        Argv.option({
            name: 'setup',
            short: 's',
            type: 'boolean',
            description: 'Triggers interactive setup',
            example: "'unistack --setup'"
        })
        const commands = Argv.run(processArgs)
        return {
            setup: commands.options.setup
        }
    },
    bundle(options = {}) {
        const bootstrapPath = Path.join(this.system.unistackPath, 'bootstrap')
        const configFile = Path.join(bootstrapPath, 'jspm.config.js')
        const entryFile = options.entryFile || false
        const outputFile = options.outputFile || false

        if (typeof entryFile !== 'string' || typeof outputFile !== 'string') {
            throw new Error('Entry and output paths are required.')
        }

        delete options.entryFile
        delete options.outputFile

        return new Bundler({
            jspm: require('jspm'),
            baseURL: this.system.environmentPath,
            configFile: configFile,
            expression: entryFile,
            outLoc: outputFile,
            logPrefix: 'unistack-bundler',
            buildOptions: options
        })
    },
    bundleForNode(production) {
        const environmentPath = this.system.environmentPath
        const bootstrapPath = Path.join(this.system.unistackPath, 'bootstrap')
        const outputFile = (production ?
            Path.join(environmentPath, 'dist', 'server.bundle.js') :
            Path.join(bootstrapPath, 'server', 'server.bundle.js')
        )
        const bundle = this.bundle({
            sfx: true,
            node: true,
            production: production,
            sourceMaps: true,
            entryFile: Path.join(bootstrapPath, 'server', 'index.js'),
            outputFile: outputFile
        })
        return bundle.build()
    },
    bundleForBrowser() {
        const environmentPath = this.system.environmentPath
        const bootstrapPath = Path.join(this.system.unistackPath, 'bootstrap')
        const bundle = this.bundle({
            sourceMaps: true,
            entryFile: Path.join(bootstrapPath, 'client', 'index.js'),
            outputFile: Path.join(environmentPath, 'dist', 'client.bundle.js')
        })
        return bundle.build()
    },
    startDevEnvironment(config) {
        return Promise.resolve()
    },
    throwError(error) {
        throw error
    },
    throwAsyncError(error) {
        setTimeout(() => this.throwError(error), 0)
        return false
    },
    handleError(error, warning, hook) {
        if (typeof error === 'string') {
            error = new Error(error)
        }
        if (!warning) {
            if (typeof hook === 'function') {
                if (hook(error) === false) {
                    return;
                }
            }
            this.throwError(error)
        }
        error.stack = ''
        console.warn(error.message);
    }
}

export default UniStack
