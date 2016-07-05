var Path = require('path')

var App = {
    base: {},
    errors: {}
}

App.base.directory = (
    typeof process === 'object' && process.env['NODE_ENV'] === 'testing'
    ? Path.join(process.cwd(), 'core/server/test/app')
    : (typeof process === 'object' ? process.cwd() : '/')
)
App.base.directories =  [
    Path.join(App.base.directory, 'src'),
    Path.join(App.base.directory, 'dist')
]
App.errors.invalidCLIArguments = `
    Something went wrong when trying to parse command line arguments.
    Please make sure that the right parameters are being passed in.
    Refer to the "unistack --help" command for proper usage and available options.
`
App.errors.invalidConfigPath = `
    Please provide a valid configuration filename.
    The filename received ({{filename}}) could not be loaded.
`
App.errors.installationDirectoryIsPopulated = `
    This directory must be empty before installation can commence.
    Please manually deleted all files (including hidden ones) from directory.
`
App.errors.invalidPackageJSON = `
    Could not parse "package.json".
    Please make sure that a valid "package.json" file exists in the app directory.
`

App.development = (
    typeof window === 'object' && window.__karma__ ?
    false : true
)
module.exports = App
