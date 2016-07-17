var path = require('path')
var unistackConfig = require('../config.js')

// /unistack/test/environment/node_modules/unistack/bootstrap
var bootstrap = path.join('node_modules', 'unistack', 'bootstrap')
var preprocessors = {}
preprocessors[path.join(bootstrap, '{client/!(reloader),client/!(test)/**}.js')] =
preprocessors[path.join(bootstrap, 'components/**/*.js')] =
preprocessors[path.join(bootstrap, 'shared/**/*.js')] =
[ 'jspm' ]

// See https://saucelabs.com/platforms for all browser/platform combos
var customLaunchers = {
    'SL_Chrome': {
        base: 'SauceLabs',
        browserName: 'chrome',
        version: '47'
    },
    'SL_Firefox': {
        base: 'SauceLabs',
        browserName: 'firefox',
        version: '43'
    },
    'SL_Safari_8': {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'OS X 10.10',
        version: '8'
    },
    'SL_Safari_9': {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'OS X 10.11',
        version: '9'
    },
    'SL_IE_11': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: '11'
    }
}

module.exports = function(config) {
    config.set({
        basePath: unistackConfig.environment.directory,
        sauceLabs: {
            testName: 'UniStack Enviroment Client Unit Test',
            startConnect: true,
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY
        },
        frameworks: [ 'jspm', 'jasmine' ],
        plugins: [
            'karma-jspm',
            'karma-jasmine',
            'karma-sauce-launcher'
        ],
        jspm: {
            stripExtension: false,
            config: path.join(bootstrap, 'jspm.config.js'),
            packages: path.join(bootstrap, 'jspm_packages'),
            loadFiles: [
                'src/{client/*,client/!(css|test)/**}.js',
                'src/shared/**/*.js',
                path.join(bootstrap, 'client/index.js'),
                path.join(bootstrap, 'client/test/specs/**/*.js'),
                path.join(bootstrap, 'shared/**/*.js'),
                path.join(bootstrap, 'config.js')
            ]
        },
        proxies: {
            '/src': '/base/src',
            '/node_modules': '/base/node_modules',
        },
        preprocessors: preprocessors,
        coverageReporter: {
            type : 'lcovonly',
            dir : path.join(process.cwd(), 'bootstrap/client/test'),
            subdir: '.',
            file: 'lcov.info'
        },
        reporters: [ 'progress', 'jspm', 'saucelabs' ],
        port: 9876,
        colors: true,
        debug: false,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 1,
        browserNoActivityTimeout : 4*60*1000, //default 10000
        captureTimeout : 4*60*1000, //default 60000
        singleRun: true,
        concurrency: Infinity
    })
    if (process.env.TRAVIS) {
        var buildLabel = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')'

        config.sauceLabs.build = buildLabel
        config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER
        config.sauceLabs.recordScreenshots = true

        if (process.env.BROWSER_PROVIDER === 'saucelabs' || !process.env.BROWSER_PROVIDER) {
            // Allocating a browser can take pretty long (eg. if we are out of capacity and need to wait
            // for another build to finish) and so the `captureTimeout` typically kills
            // an in-queue-pending request, which makes no sense.
            config.captureTimeout = 0
        }
    }
}
