const development = (
    typeof window === 'object' && window.__karma__ ?
    false : true
)
const hostName = 'localhost'
const serverPort = 8080
const reloaderPort = 9090

export {
    development,
    hostName,
    serverPort,
    reloaderPort
}

