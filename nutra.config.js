module.exports = function( config ) {
    config.set({
        frameworks: ['nutra-jasmine'],
        files: ['core/server/test/specs/**/*.js', 'src/**/*.js'],
        preprocessors: {
            'core/server/test/specs/**/*.js': ['nutra-babel'],
            'src/**/*.js': ['nutra-babel', 'nutra-coverage']
        },
        reporters: ['nutra-minimal-reporter', 'nutra-coverage'],
        babelOptions: {
            configFile: './.babelrc'
        },
        coverageOptions: {
            dir : 'core/server/test',
            reporters: [
                { type: 'html', subdir: 'coverage' },
                { type: 'lcovonly', subdir: 'coverage', file: 'lcov.info' }
            ]
        }
    })
}
