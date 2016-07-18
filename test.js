#!/usr/bin/env node
process.env['NODE_ENV'] = 'testing'

var fs = require('fs-extra')
var path = require('path')

var sauceLabs = fs.readFileSync('./.saucelabs', 'utf8')
process.env.SAUCE_USERNAME = sauceLabs.split('\n')[0].split('=')[1].trim()
process.env.SAUCE_ACCESS_KEY = sauceLabs.split('\n')[1].split('=')[1].trim()

if (process.argv[2] === '--quick') {
    console.log('-Doing only a quick run!')
    console.log('-Skipping environment tests and package installations...')
    process.env.QUICK_TEST_RUN = true
}

var karma = require('karma')
var nutra = require('nutra')
var config = require('./config.js')

var rootPath = process.cwd()
var tmpDirectory = path.join(rootPath, 'tmp')
var bootstrapPath = path.join(rootPath, 'bootstrap')
var environmentPath = path.join(rootPath, 'environment')
var testEnvironmentPath = config.environment.directory
var testEnvironmentUniStackPath = path.join(
    testEnvironmentPath,
    'node_modules/unistack'
)
var testEnvironmentBootstrapPath = path.join(
    testEnvironmentUniStackPath,
    'bootstrap'
)

var setupEnviroment = function () {
    fs.emptyDirSync(tmpDirectory)
    fs.ensureDirSync(tmpDirectory)
    fs.emptyDirSync(testEnvironmentPath)
    fs.ensureDirSync(testEnvironmentPath)
    fs.copySync(environmentPath, testEnvironmentPath)
    fs.copySync(
        path.join(rootPath, 'config.js'),
        path.join(testEnvironmentUniStackPath, 'config.js')
    )
    fs.copySync(bootstrapPath, testEnvironmentBootstrapPath)
    return Promise.resolve()
}

var runNutra = function () {
    console.log('-Testing server...')
    return nutra({
        configFile: './nutra.config.js'
    })
    .start()
    .then(exitCode => {
        if (exitCode === 0) {
            console.log('-Done succesfully testing server!')
        } else {
            console.log('-Done failing at testing server!')
        }
    })
}

var runEnvironmentKarma = function () {
    if (process.env.QUICK_TEST_RUN) {
        return Promise.resolve()
    } else {
        return new Promise((resolve, reject) => {
            console.log('-Testing environment client...')
            var karmaInstance = new karma.Server({
                configFile: path.join(testEnvironmentBootstrapPath, 'karma.config.js')
            }, function (exitCode) {
                if (exitCode === 0) {
                    console.log('-Done succesfully testing environment client!')
                } else {
                    console.log('-Done failing at testing environment client!')
                }
                resolve(exitCode)
            })
            karmaInstance.start()
        })
    }
}

var runEnvironmentNutra = function () {
    if (process.env.QUICK_TEST_RUN) {
        return Promise.resolve()
    } else {
        console.log('-Testing environment server...')
        return nutra({
            configFile: path.join(testEnvironmentBootstrapPath, 'nutra.config.js'),
            absolutePaths: true
        })
        .start()
        .then(exitCode => {
            if (exitCode === 0) {
                console.log('-Done succesfully testing environment server!')
            } else {
                console.log('-Done failing at testing environment server!')
            }
        })
    }
}

var generateUnifiedCoverage = function () {
    var escapeRegex = function (value) {
        return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
    }
    // get coverage reports
    var unistack = fs.readFileSync('./test/lcov.info', 'utf8')
    var envClient = fs.readFileSync('./bootstrap/client/test/lcov.info', 'utf8')
    var envServer = fs.readFileSync('./bootstrap/server/test/lcov.info', 'utf8')
    // stipulate the paths that need to be changed
    var basePath = escapeRegex(process.cwd() + '/')
    var testEnvPath = escapeRegex('test/environment/')
    var testEnvUniStackPath = escapeRegex('test/environment/node_modules/unistack/')
    var envPath = 'environment/'
    // make regexes out of the paths
    var regexOne = new RegExp(basePath + '|' + testEnvUniStackPath, 'g')
    var regexTwo = new RegExp(testEnvPath, 'g')
    // replace the paths accordingly
    unistack = unistack.replace(regexOne, '').replace(regexTwo, envPath)
    envClient = envClient.replace(regexOne, '').replace(regexTwo, envPath)
    envServer = envServer.replace(regexOne, '').replace(regexTwo, envPath)
    // write the final report
    fs.writeFileSync('./lcov.info', unistack + envClient + envServer)
}

Promise
.resolve()
.then(setupEnviroment)
.then(runNutra) // this must run first — it installs the jspm dependencies
.then(runEnvironmentKarma)
.then(runEnvironmentNutra)
.then(generateUnifiedCoverage)
.then(exitCode => {
    console.log('-Done succesfully testing all!')
    process.exit(exitCode)
})
.catch(e => {
    console.log(e.stack)
    process.exit(1)
})
