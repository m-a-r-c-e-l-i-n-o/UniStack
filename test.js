process.env['NODE_ENV'] = 'testing'
var Fs = require('fs-extra')
var Path = require('path')
var Karma = require('karma')
var Nutra = require('nutra')
var AppConfig = require('./app.config.js')
var CLI = require('./dist/cli.js').default

function RunKarma () {
    // setup jspm enviroment
    var corePath = Path.join(__dirname, 'core')
    var serverAppPath = Path.join(corePath, 'server', 'test', 'app')
    var tmpPath = Path.join(corePath, '..', 'tmp')
    var tmpAppPath = Path.join(tmpPath, 'app')
    var clientCorePath = Path.join(
            AppConfig.base.directory,
            'node_modules/unistack/core'
        )
    CLI.validateInstallationDirectory()
    CLI.setupPackageJSON()
    CLI.copyBaseDirectoriesToProject()
    // mimic npm install unistack
    Fs.renameSync(serverAppPath, tmpAppPath)
    Fs.copySync(
        corePath,
        Path.join(tmpPath, 'app/node_modules/unistack/core')
    )
    Fs.renameSync(tmpAppPath, AppConfig.base.directory)

    function tearDown() {
        Fs.removeSync(Path.join(corePath, 'jspm_packages', 'npm'))
        Fs.removeSync(Path.join(corePath, 'jspm_packages', 'github'))
        Fs.emptyDirSync(AppConfig.base.directory)
    }

    return new Promise((resolve, reject) => {
        console.log('-Testing client now...')
        var karmaInstance = new Karma.Server({
            configFile: Path.join(process.cwd(), 'karma.config.js')
        }, function (exitCode) {
            if (exitCode === 0) {
                console.log('-Done succesfully testing client!')
            } else {
                console.log('-Done failing at testing client!')
            }
            tearDown()
            resolve(exitCode)
        })
        karmaInstance.start()
    })
}

function RunNutra () {
    console.log('-Testing server first. Hang tight, this will take some time...')
    return Nutra('nutra.config.js')
        .start()
        .then(() => {
            console.log('-Done succesfully testing server!')
        })
        .catch(e => {
            console.log('-Done failing at testing server!')
            console.log(e)
        })
}

// general clean up
console.log('-Cleaning up test related directories...')
Fs.ensureDir(Path.join(__dirname, 'tmp'))
Fs.emptyDirSync(Path.join(__dirname, 'tmp'))
Fs.ensureDir(AppConfig.base.directory)
Fs.emptyDirSync(AppConfig.base.directory)
console.log('-Done succesfully cleaning up test related directories!')

// start tests
console.log('-Attempting to test server and client...')
Promise.resolve()
    .then(RunNutra)
    .then(RunKarma)
    .then(exitCode => {
        console.log('-Done succesfully testing server and client!')
        process.exit(exitCode)
    })
    .catch(e => console.log(e.stack))

