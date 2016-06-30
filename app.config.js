var Path = require('path')

var App = {
    base: {},
    errors: {}
}

App.base.directory = ( process.env['NODE_ENV'] === 'testing'
    ? Path.join(process.cwd(), 'test/app')
    : process.cwd()
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
App.errors.occupiedDirectories = `
    The following {{directories}} directories need to be deleted before installation.
    Please manually deleted them and try again.
`
App.errors.invalidPackageJSON = `
    Could not parse "package.json".
    Please make sure that a valid "package.json" file exists in this directory.
`
module.exports = App
