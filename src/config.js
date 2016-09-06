import { getEnvironmentPath } from './helpers/path-resolution.js'

export const server = {
    hostName: 'localhost',
    serverPort: 8080,
    socketPort: 5776
}

export const environment = {
    path: getEnvironmentPath()
}
