var Path = require('path')

var Config = {
    environment: {},
    errors: {}
}

Config.environment.directory = (
    typeof process === 'object' && process.env['NODE_ENV'] === 'development'
    ? Path.join(process.cwd(), './test/environment')
    : (typeof process === 'object' ? process.cwd() : '/')
)

Config.errors.invalidCLIArguments = `
    Something went wrong when trying to parse command line arguments.
    Please make sure that the right parameters are being passed in.
    Refer to the "unistack --help" command for proper usage and available options.
`
Config.errors.invalidConfigPath = `
    Please provide a valid configuration filename.
    The filename received ({{filename}}) could not be loaded.
`
Config.errors.installationDirectoryIsPopulated = `
    This directory must be empty before installation can commence.
    Please manually deleted all files (including hidden ones) from directory.
`
Config.errors.invalidPackageJSON = `
    Could not parse "package.json".
    Please make sure that a valid "package.json" file exists in the Config directory.
`

module.exports = Config
