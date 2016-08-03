'use strict'
import Fs from 'fs-extra'
import Path from 'path'
import _ from 'lodash'
import ChildProcess from 'child_process'
import Bundler from 'jspm-dev-builder'
import { Gaze } from 'gaze'
import IO from 'socket.io'
import ServerDestroy from 'server-destroy'
import Minimatch from 'minimatch'
import { createServer as CreateServer } from 'http'
import Config from '../config.js'
import State from './core-state.js'

class UniStack {
    // start of utility methods
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
    // end of utility methods
    // start of interaction with CLI
    listenToCLI() {
        const state = this.getState()
        const ipc = require('ipc-event-emitter').default(process)

        state.cli.ipc = ipc

        return new Promise((resolve, reject) => {
            ipc.fix('core::ready')
            ipc.on('cli::command', (command) => {
                if (command.type === 'terminate') {
                    return resolve(ipc)
                }
                this.handleCLICommand(command)
            })
        })
    }
    handleCLICommand(command) {
        switch(command.type) {
            // 'init': this.initSetup()
            // 'start-dev': this.startDevEnvironment()
            // 'stop-dev': this.startDevEnvironment()
            default:
                this.emitEventToCLI({ type: 'command_not_found', data: command })
        }
    }
    emitEventToCLI(data) {
        const state = this.getState()
        state.cli.ipc.emit('core::status', data)
    }
    // end of interaction with CLI
    // start of procedural methods
    async initSetup() { // abstract to its own module
        try {
            await this.isEnvironmentEmpty()
            await this.setupPackageJSON()
            await this.setupEnvironment()
            await this.installNPMDependencies()
            await this.installJSPMDependencies()
        } catch (data) {
            this.emitEventToCLI({ type: 'error', data })
        }
    }
    async startDevEnvironment() { // abstract to its own module
        try {
            await this.isUnistackEnvironment()
            await this.initNodeBundle()
            await this.initBrowserBundle()
            await this.initReloader()
            await this.watchFiles()
            await this.runNodeBundle()
        } catch (data) {
            this.emitEventToCLI({ type: 'error', data })
        }
    }
    async stopDevEnvironment() { // abstract to its own module
        try {
            await this.haltNodeBundle()
            await this.destroyReloader()
            await this.destroyWatcher()
        } catch (data) {
            this.emitEventToCLI({ type: 'error', data })
        }
    }
    // end of procedural methods
    // start of "initSetup" methods
    isEnvironmentEmpty() {
        const system = this.getSystemConstants()

        return new Promise((resolve, reject) => {
            if (Fs.readdirSync(system.environment.root).length > 0) {
                reject({ message: 'INSTALLATION_DIRECTORY_IS_POPULATED' })
            }
            resolve(true)
        })
    }
    setupPackageJSON() {
        const system = this.getSystemConstants()
        const unistackBootstrapPath = Path.join(system.root, 'bootstrap')
        const packageJSON = Path.join(unistackBootstrapPath, 'package.json')
        const packageJSONObj = require(packageJSON)
        const jspmConfigFiles = packageJSONObj.jspm.configFiles
        const jspmDirectories = packageJSONObj.jspm.directories

        packageJSONObj.unistack = true
        jspmConfigFiles.jspm = 'node_modules/unistack/bootstrap/jspm.config.js'
        jspmDirectories.packages = 'node_modules/unistack/bootstrap/jspm_packages'

        return new Promise((resolve, reject) => {
            Fs.writeFileSync(
                Path.join(system.environment.root, 'package.json'),
                JSON.stringify(packageJSONObj, null, '\t')
            )
            resolve(true)
        })
    }
    setupEnvironment() {
        const system = this.getSystemConstants()
        const envPath = system.environment.root

        return new Promise((resolve, reject) => {
            Fs.copySync(Path.join(system.root, 'environment'), envPath)
            resolve(true)
        })
    }
    installNPMDependencies(testCommand) {
        const system = this.getSystemConstants()
        const command = testCommand || "npm install"
        const options = { cwd: system.environment.root }

        return new Promise((resolve, reject) => {
            ChildProcess.exec(command, options, (error, stdout, stderr) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(true)
                }
            })
        })
    }
    installJSPMDependencies() {
        const system = this.getSystemConstants()
        const jspm = require('jspm')

        jspm.setPackagePath(system.environment.root)

        return jspm.dlLoader().then(() => jspm.install(true))
    }
    // end of "initSetup" methods
    // start of "startDevEnvironment" methods
    isUnistackEnvironment() {
        const system = this.getSystemConstants()
        const envPath = system.environment.root
        const envPackageJSONFile = Path.join(envPath, 'package.json')

        return new Promise((resolve, reject) => {
            let envPackageJSONObj
            try {
                envPackageJSONObj = require(envPackageJSONFile)
            } catch (e) {
                return reject({ message: 'NO_ENVIRONMENT_PACKAGE_JSON_FILE' })
            }
            if (envPackageJSONObj.unistack) {
                return resolve(true)
            }
            reject({ message: 'NOT_UNISTACK_ENVIRONMENT' })
        })
    }
    initNodeBundle(production) {
        const state = this.getState()
        const system = this.getSystemConstants()
        const envPath = system.environment.root
        const envUnistackPath = system.environment.unistack.root
        const envUnistackBootstrapPath = Path.join(envUnistackPath, 'bootstrap')
        const entryFile = Path.join(envUnistackBootstrapPath, 'server', 'index.js')
        const outputFile = (production ?
            Path.join(envPath, 'dist', 'server.bundle.js') :
            Path.join(envUnistackBootstrapPath, 'server', 'server.bundle.js')
        )
        const buildOptions = {
            sfx: true,
            node: true,
            production: production || false,
            sourceMaps: true
        }
        const bundler = this.bundle(entryFile, outputFile, buildOptions)

        state.environment.bundles.node.bundler = bundler

        return bundler.build().then(() => bundler)
    }
    initBrowserBundle() {
        const state = this.getState()
        const system = this.getSystemConstants()
        const envUnistackPath = system.environment.unistack.root
        const envPath = system.environment.root
        const envUnistackBootstrapPath = Path.join(envUnistackPath, 'bootstrap')
        const entryFile = Path.join(envUnistackBootstrapPath, 'client', 'index.js')
        const outputFile = Path.join(envPath, 'dist', 'client.bundle.js')
        const buildOptions = { sourceMaps: true }
        const bundler = this.bundle(entryFile, outputFile, buildOptions)

        state.environment.bundles.browser.bundler = bundler

        return bundler.build().then(() => bundler)
    }
    initReloader() {
        const state = this.getState()
        const server = CreateServer()
        const io = IO(server)

        return new Promise((resolve, reject) => {
            server.listen(Config.server.reloaderPort, () => {
                state.reloader.server = server
                state.reloader.io = io
                resolve(state.reloader)
            })
            ServerDestroy(server)
        })
    }
    watchFiles() {
        const state = this.getState()
        const system = this.getSystemConstants()
        const envPath = system.environment.root
        const envUnistackPath = system.environment.unistack.root
        const envBootstrapPath = Path.join(envPath, 'bootstrap')
        const gaze = new Gaze([
            Path.join(envPath, '{*,!(node_modules)/*/!(test),!(node_modules)/*/!(test)/**/*}.+(js|json)'),
            Path.join(envBootstrapPath, '{*,**/*}.+(js|json)')
        ])

        gaze.on('changed', this.handleFileChange.bind(this))

        return new Promise((resolve, reject) => {
            gaze.on('ready', () => resolve(gaze))
        })
        .then(gaze => state.watcher.server = gaze)
    }
    runNodeBundle() {
        const state = this.getState()
        const system = this.getSystemConstants()
        const envUnistackPath = system.environment.unistack.root
        const envPath = system.environment.root
        const envUnistackBootstrapPath = Path.join(envUnistackPath, 'bootstrap')
        const serverBundle = Path.join(envUnistackBootstrapPath, 'server', 'server.bundle.js')
        const bundle = require(serverBundle).default

        return bundle.serve
        .then(server => {
            ServerDestroy(server)
            return state.environment.server = server
        })
    }
    // start of helper methods
    bundle(entryFile, outputFile, buildOptions) { // side effect of initNodeBundle, initBrowserBundle
        const system = this.getSystemConstants()
        const envPath = system.environment.root
        const envUnistackPath = system.environment.unistack.root
        const envUnistackBootstrapPath = Path.join(envUnistackPath, 'bootstrap')
        const envJSPMConfigFile = Path.join(envUnistackBootstrapPath, 'jspm.config.js')

        return new Bundler({
            jspm: require('jspm'),
            baseURL: envPath,
            configFile: envJSPMConfigFile,
            expression: entryFile,
            outLoc: outputFile,
            logPrefix: 'unistack-bundler',
            buildOptions: buildOptions
        })
    }
    handleFileChange(filename) { // side effect of watchFiles
        const state = this.getState()
        const system = this.getSystemConstants()
        const envSrcPath = Path.join(system.environment.root, 'src')
        const envSrcClientPattern = '{client/*,client/!(test)/**/*}.js'
        const envSrcClientFiles = Path.join(envSrcPath, envSrcClientPattern)
        const envSrcServerPattern = '{server/*,server/!(test)/**/*}.js'
        const envSrcServerFiles = Path.join(envSrcPath, envSrcServerPattern)
        const envSrcSharedPattern = '{shared/*,shared/**}.js'
        const envSrcSharedFiles = Path.join(envSrcPath, envSrcSharedPattern)
        const throttle = state.environment.bundles.throttle
        const explicitNode = Minimatch(filename, envSrcServerFiles)
        const shared = Minimatch(filename, envSrcSharedFiles)
        const browser = shared || Minimatch(filename, envSrcClientFiles)
        const node = shared || explicitNode

        let config = { node, browser, explicitNode }

        if (throttle.timer) {
            clearTimeout(throttle.timer)
            config = throttle.config = {
                node: throttle.config.node || config.node,
                browser: throttle.config.browser || config.browser,
                explicitNode: throttle.config.explicitNode || config.explicitNode
            }
        } else {
            throttle.config = config
        }

        throttle.timer = setTimeout((config => () => {
            throttle.timer = null
            this.rebuildBundles(config)
        })(config), throttle.timeout)

        if (browser && !explicitNode) {
            this.emitEvent('change', filename)  // move to CLI and remake hot-reloader
        }
    }
    rebuildBundles(config) {  // side effect of rebuildBundles
        const state = this.getState()
        const bundles = state.environment.bundles

        let promise = Promise.resolve()

        if (config.browser) {
            promise = promise.then(bundles.browser.bundler.build())
        }

        if (config.node) {
            promise = Promise.all([promise, bundles.node.bundler.build()])
            .then(() => {
                if (config.explicitNode) {
                    this.emitEvent('reload') // move to CLI and remake hot-reloader
                }
                return true
            })
        }

        return promise
        .catch(data => this.emitEventToCLI({ type: 'error', data }))
    }
    emitEvent(type, data) {  // side effect of handleFileChange, rebuildBundles
        // move to CLI and remake hot-reloader
        const state = this.getState()
        state.reloader.io.emit(type, data)
    }
    // end of helper methods
    // end of "startDevEnvironment" methods
    // start of "stopDevEnvironment" methods
    haltNodeBundle() {
        const state = this.getState()
        return new Promise((resolve, reject) => {
            state.environment.server.destroy(resolve)
        })
    }
    destroyReloader() {
        const state = this.getState()
        return new Promise((resolve, reject) => {
            state.reloader.server.destroy(resolve)
        })
    }
    destroyWatcher() {
        const state = this.getState()
        return new Promise((resolve, reject) => {
            state.watcher.server.close()
            resolve(true)
        })
    }
    // end of "stopDevEnvironment" methods
    // to be deprecated
    destroyProject() {
        const system = this.getSystemConstants()
        Fs.emptyDirSync(system.environment.root)
    }
    resolveConfig(filename) {
        return new Promise((resolve, reject) => {
            if (!filename) {
                filename = {}
            }
            if (_.isObject(filename)) {
                return resolve(filename)
            }
            let configWrapper
            const system = this.getSystemConstants()
            const configFilename = Path.join(system.environment.root, filename)
            try {
                configWrapper = require(configFilename)
            } catch (e) {
                return reject({
                    message: 'INVALID_CONFIG_PATH',
                    template: { filename: configFilename }
                })
            }
            const config = Object.seal({
                options: null,
                set: function (opts) {
                   this.options = opts
                }
            })
            configWrapper(config)
            resolve(config.options)
        })
    }
}

export default UniStack
