import * as path from 'path'

const development = (
    typeof window === 'object' && window.__karma__ ?
    false : true
)
const hostName = 'localhost'
const serverPort = 8080
const reloaderPort = 5776

const environment = {
    directory: (
        typeof process === 'object' &&
        (process.env['NODE_ENV'] === 'testing' ||
         process.env['NODE_ENV'] === 'development')
        ? path.join(process.cwd(), 'test', 'environment')
        : (typeof process === 'object' ? process.cwd() : '.')
    )
}

export {
    environment,
    development,
    hostName,
    serverPort,
    reloaderPort
}

