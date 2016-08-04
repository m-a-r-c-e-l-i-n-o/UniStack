var Path = require('path')

var Config = {
    environment: {},
    message: {
        success: {},
        error: {},
        update: {}
    },
    server: {},
    hostName: 'localhost',
    serverPort: 8080,
    reloaderPort: 5776
}

Config.server.hostName = 'localhost'
Config.server.serverPort = 8080
Config.server.reloaderPort = 5776

Config.environment.directory = (
    typeof process === 'object' && process.env['NODE_ENV'] === 'development' ?
    Path.join(process.cwd(), 'test', 'environment') :
    ( typeof process === 'object' ? process.cwd() : '' )
)

Config.message.error.INVALID_CONFIG_PATH = `
    Please provide a valid configuration filename.
    The filename received ({{filename}}) could not be loaded.
`
Config.message.error.INSTALLATION_DIRECTORY_IS_POPULATED = `
    This directory must be empty before installation can commence.
    Please manually deleted all files (including hidden ones) from directory.
`
Config.message.error.NOT_UNISTACK_ENVIRONMENT = `
    It appears that this directory is not an unistack environment. If there is a
    high degree of confidence that this is in fact a unistack environment,
    try reinserting a "unistack" property with a truthy value in the package.json
    file and run the "start" command below to retry starting the dev environment.
    However, it's crucial to understand how this property went missing in
    the first place, as other parts of the system could have been impacted.
`
Config.message.error.NO_ENVIRONMENT_PACKAGE_JSON_FILE = `
    It appears that this directory is not an unistack environment. This was
    determined do to a failure in loading up the package.json file that holds
    information about the environment. If there is a high degree of confidence
    that this is in fact a unistack environment, try restating a package.json
    file and run the "start" command below. If there is a high degree of confidence
    that this is NOT a unistack environment, delete all files in the directory
    and run the "init" command below to setup a new environment.
`
Config.message.error.EXIT = `
    UniStack exited unexpectedly with the following error:
    {{error_stack}}
`
Config.message.error.CORE_EXIT = `
    The core process has exited unexpectedly, for the following reason:
    {{error_stack}}
`
Config.message.error.UNKNOWN_CORE_EXIT = `
    The core process has exited unexpectedly for unknown reasons.
`
Config.message.success.CORE_EXIT = `
    The core process has exited succesfully.
`
Config.message.success.UNKNOWN_CORE_EXIT = `
    The core process has exited unexpectedly, there doesn't seem to be errors.
`
module.exports = Config
