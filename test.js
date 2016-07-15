#!/usr/bin/env node
process.env['NODE_ENV'] = 'testing'

var fs = require('fs-extra')
var path = require('path')
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

var runEnvironmentNutra = function () {
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

Promise
.resolve()
.then(setupEnviroment)
.then(runNutra) // this must run first — it installs the jspm dependencies
.then(runEnvironmentKarma)
.then(runEnvironmentNutra)
.then(exitCode => console.log('-Done succesfully testing all!'))
.catch(e => console.log(e.stack))

