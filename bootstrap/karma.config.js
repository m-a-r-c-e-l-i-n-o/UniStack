var path = require('path')
var unistackConfig = require('../config.js')

// /unistack/test/environment/node_modules/unistack/bootstrap
var bootstrap = path.join('node_modules', 'unistack', 'bootstrap')
var preprocessors = {}
preprocessors[path.join(bootstrap, '{client/!(reloader),client/!(test)/**}.js')] =
preprocessors[path.join(bootstrap, 'components/**/*.js')] =
preprocessors[path.join(bootstrap, 'shared/**/*.js')] =
[ 'jspm' ]

module.exports = function(config) {
    config.set({
        basePath: unistackConfig.environment.directory,
        frameworks: [ 'jspm', 'jasmine' ],
        plugins: [
            'karma-jspm',
            'karma-jasmine',
            'karma-chrome-launcher'
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
            type : 'html',
            dir : path.join(process.cwd(), 'bootstrap/client/test'),
            subdir: 'coverage'
        },
        reporters: [ 'progress', 'jspm' ],
        port: 9876,
        colors: true,
        debug: false,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: [ 'Chrome' ],
        singleRun: true,
        concurrency: Infinity
    })
}
