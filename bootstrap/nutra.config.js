var path = require('path')
var unistackConfig = require('../config.js')

// /unistack/test/environment
var testEnvironmentPath = unistackConfig.environment.directory
// /unistack/test/environment/node_modules/unistack
var testEnvironmentUniStackPath = path.join(
    testEnvironmentPath,
    'node_modules/unistack'
)
// /unistack/test/environment/node_modules/unistack/bootstrap
var testEnvironmentBootstrapPath = path.join(
    testEnvironmentUniStackPath,
    'bootstrap'
)
var preprocessors = {}
var serverFiles = path.join(
    testEnvironmentBootstrapPath,
    '{server/*,server/!(test)/**}.js'
)
var environmentServerFiles = path.join(
    testEnvironmentPath,
    'src/{server/*,server/!(test)/**}.js'
)
preprocessors[serverFiles] =
preprocessors[environmentServerFiles] =
['nutra-coverage']

module.exports = function( config ) {
    config.set({
        frameworks: ['nutra-jasmine'],
        files: [
            path.join(testEnvironmentBootstrapPath, '{server/*,server/!(test)/**}.js'),
            path.join(testEnvironmentBootstrapPath, 'server/test/specs/**/*.js'),
            path.join(testEnvironmentPath, 'src/{server/*,server/!(test)/**}.js')
        ],
        preprocessors: preprocessors,
        moduleloader: 'nutra-jspm',
        reporters: ['nutra-coverage'],
        jspmOptions: {
            packagePath: testEnvironmentPath
        },
        coverageOptions: {
            dir : './bootstrap/server/test',
            reporters: [
                { type: 'html', subdir: 'coverage' },
                { type: 'lcovonly', subdir: 'coverage', file: 'lcov.info' }
            ]
        }
    })
}
