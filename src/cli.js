'use strict'
import Fs from 'fs-extra'
import Path from 'path'
import _ from 'lodash'
import Inquirer from 'inquirer'
import AppConfig from '../app.config.js'
import Argv from 'argv'
import NPMI from 'npmi'

const CLI = {
    setupQuestions: [{
            type: 'input',
            name: 'projectName',
            message: 'What\'s the name of your project?',
            default: () => {
                return CLI.getProjectName()
            }
        }
    ],
    constructor(processArgs) {
        try {
            const args = this.parseArguments(processArgs)
            if (args.setup) {
                this.initInteractiveSetup()
            } else {
                this.startDevEnviroment(
                    this.resolveConfig(args.config)
                )
            }
        } catch (e) {
            console.log(e)
            this.handleError(e, true, true)
        }
    },
    resolveConfig(filename) {
        if (!filename) {
            filename = {}
        }
        if (_.isObject(filename)) {
            return filename
        }
        let configWrapper
        const configFilename = Path.join(AppConfig.base.directory, filename)
        try {
            configWrapper = require(configFilename)
        } catch(e) {
            throw new Error(
                AppConfig.errors.invalidConfigPath
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
        if (Fs.readdirSync(AppConfig.base.directory).length > 0) {
            throw new Error(AppConfig.errors.installationDirectoryIsPopulated)
        }
    },
    getProjectName() {
        let projectName
        try {
            projectName = require(
                Path.join(AppConfig.base.directory, 'package.json')
            ).name
        } catch (e) {}
        return projectName || Path.basename(AppConfig.base.directory)
    },
    copyBaseDirectoriesToProject() {
        Fs.copySync(Path.join(__dirname, '../base'), AppConfig.base.directory)
    },
    installNPMDependencies() {
        console.log('Installing NPM dependencies!')
        return new Promise((resolve, reject) => {
            const npmiOptions = {
                path: AppConfig.base.directory
            }
            NPMI(npmiOptions, function (err, result) {
                if (!err) {
                    console.log('All done installing NPM dependencies!')
                    resolve(true)
                } else {
                    switch(err.code) {
                        case npmi.LOAD_ERR:
                            console.log('npm load error')
                            break;
                        case npmi.INSTALL_ERR:
                            console.log('npm install error')
                            break;
                        default:
                            console.log(err.message)
                    }
                    reject()
                }
            })
        })
    },
    installJSPMDependencies() {
        const jspm = require('jspm')
        jspm.setPackagePath(AppConfig.base.directory)
        return jspm.install(true, { force: true })
            .catch(e => console.log(e))
            .then(() => {
                return true
            })
    },
    askSetupQuestions() {
        return Inquirer.prompt(this.setupQuestions)
    },
    processSetupAnswers(answers) {
        return Promise.resolve()
    },
    setupPackageJSON() {
        const corePath = Path.join(__dirname, '..', 'core')
        const packageJSON = Path.join(corePath, 'package.json')
        const packageJSONObj = require(packageJSON)
        const configFiles = packageJSONObj.jspm.configFiles
        configFiles.jspm = 'node_modules/unistack/core/jspm.config.js'
        const directories = packageJSONObj.jspm.directories
        directories.packages = 'node_modules/unistack/core/jspm_packages'
        Fs.writeFileSync(
            Path.join(AppConfig.base.directory, 'package.json'),
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
            .catch(e => this.handleError(e))
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
            .catch(e => this.handleError(e))
    },
    destroyProject() {
        Fs.emptyDirSync(AppConfig.base.directory)
    },
    parseArguments(processArgs) {
        if (!Array.isArray(processArgs)) {
            processArgs = []
        }
        try {
            Argv.option({
                name: 'setup',
                short: 's',
                type: 'boolean',
                description: 'Triggers interactive setup',
                example: "'unistack --setup'"
            })
            const commands = Argv.run(processArgs);
            return {
                setup: commands.options.setup
            }
        } catch (e) {
            throw new Error(AppConfig.errors.invalidCLIArguments)
        }
    },
    startDevEnviroment(config) {
        console.log('Running', config)
    },
    handleError(error, warning, fatal) {
        if (warning) {
            error.stack = ''
        }
        if (!warning || fatal) {
            throw error
        }
        console.warn(error.message)
    }
}

export default CLI
