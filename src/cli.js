'use strict'
import Fs from 'fs-extra'
import Path from 'path'
import _ from 'lodash'
import Inquirer from 'inquirer'
import AppConfig from '../app.config.js'
import Argv from 'argv'

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
    validateReservedDirectories() {
        AppConfig.base.directories.forEach(directory => {
            let stats
            try {
                stats = Fs.lstatSync(directory)
            } catch (e) {
                stats = false
            }
            if (stats && stats.isDirectory()) {
                const directories = `"${AppConfig.base.directories.join('", "')}"`
                throw new Error(
                    AppConfig.errors.occupiedDirectories.replace(
                        '{{directories}}',
                        directories
                    )
                )
            }
        })
    },
    validatePackageJSON() {
        try {
            Fs.lstatSync(Path.join(AppConfig.base.directory, 'package.json'))
        } catch (e) {
            throw new Error(
                AppConfig.errors.invalidPackageJSON
            )
        }
    },
    getProjectName () {
        let projectName
        try {
            projectName = require(
                Path.join(AppConfig.base.directory, 'package.json')
            ).name
        } catch (e) {}
        return projectName || Path.basename(AppConfig.base.directory)
    },
    askSetupQuestions () {
        return Inquirer.prompt(this.setupQuestions)
    },
    copyBaseDirectoriesToProject () {
        Fs.copySync(Path.join(__dirname, '../base'), AppConfig.base.directory)
    },
    initInteractiveSetup () {
        this.validateReservedDirectories()
        this.validatePackageJSON()
        this.copyBaseDirectoriesToProject()
        //const answers = await this.askSetupQuestions()
        //console.log(answers)
    },
    parseArguments (processArgs) {
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
    startDevEnviroment (config) {
        console.log('Running', config)
    },
    handleError (error, warning, fatal) {
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
