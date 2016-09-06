var Path = require('path')
var FS = require('fs-extra')
var Nutra = require('nutra')
var JSPM = require('jspm')

// paths
var UniEnvPath = './environment'
var UniTestPath = './test'
var UniTestEnvPath = Path.join(UniTestPath, 'environment')

if (process.argv[2] === '--quick') {
    console.log('-Doing only a quick run!')
    console.log('-Skipping environment package installation tests...')
    process.env.QUICK_TEST_RUN = true
}

var SetupEnviroment = function () {
    FS.emptyDirSync(UniTestEnvPath)
    return Promise.resolve()
}

var RunNutra = function () {
    console.log('-Testing unistack core...')
    return Nutra({ configFile: './nutra.config.js' })
    .start()
    .then(exitCode => {
        if (exitCode === 0) {
            console.log('-Done succesfully testing unistack core!')
        } else {
            console.log('-Done failing at testing unistack core!')
        }
        return exitCode
    })
}

SetupEnviroment()
.then(() => RunNutra())
.then(exitCode => setTimeout(() => process.exit(exitCode), 0))
