const coreState = {
    resolve: null,
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
    reloader: {
        server: null,
        io: null
    },
    watcher: {
        server: null
    }
}

export default coreState
