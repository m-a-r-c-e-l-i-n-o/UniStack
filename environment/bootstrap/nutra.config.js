var Path = require('path')

var UniTestEnvPath = path.join(UniTestPath, 'environment')
var UniTestEnvBootstrapPath = path.join(UniTestEnvPath, 'bootstrap')

module.exports = function(config) {
    config.set({
        frameworks: ['nutra-jasmine'],
        files: [
            path.join(testEnvironmentBootstrapPath, '{server/*,server/!(test)/**}.js'),
            path.join(testEnvironmentBootstrapPath, 'server/test/specs/**/*.js'),
            path.join(testEnvironmentPath, 'src/{server/*,server/!(test)/**}.js')
        ],
        preprocessors: {

        },
        moduleloader: 'nutra-jspm',
        reporters: ['nutra-coverage'],
        jspmOptions: {
            packagePath: testEnvironmentPath
        },
        coverageOptions: {
            dir : './bootstrap/server/test',
            reporters: [
                { type: 'lcovonly', subdir: '.', file: 'lcov.info' }
            ]
        }
    })
}
