var Path = require('path')
var Transport = require('./language/transport/index.js')

var Config = {
    environment: {},
    transport: {
        message: Transport.message
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

module.exports = Config
