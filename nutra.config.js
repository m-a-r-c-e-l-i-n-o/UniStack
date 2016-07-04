module.exports = function( config ) {
    config.set({
        frameworks: ['nutra-jasmine'],
        files: ['core/server/test/specs/**/*.js', 'src/**/*.js'],
        preprocessors: {
            'core/server/test/specs/**/*.js': ['nutra-babel'],
            'src/**/*.js': ['nutra-babel']
        },
        reporters: ['nutra-minimal-reporter'],
        babelOptions: {
            configFile: './.babelrc'
        }
    })
}

