const coreState = {
    resolve: null,
    transport: {
        message: {}
    },
    environment: {
        server: null,
        bundles: {
            node: {
                bundler: null
            },
            browser: {
                bundler: null
            },
            throttle: {
                timer: null,
                config: null,
                timeout: 2000
            }
        }
    },
    cli: {
        ipc: null
    },
    reloader: {
        server: null,
        io: null
    },
    watcher: {
        server: null
    }
}

export default coreState
