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

module.exports = Config
