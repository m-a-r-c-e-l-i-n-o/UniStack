/* eslint-env browser */
import 'systemjs-hmr'
import socketIO from 'socket.io-client'
import debug from 'debug'
const d = debug('unistack:hot-reloader')

const backendURL = '//localhost:5776'
const io = socketIO(backendURL)

io.on('connect', () => {
    d('hot reload connected to watcher on ', backendURL)
})

io.on('reload', () => {
    d('whole page reload requested')
    document.location.reload(true)
})

io.on('change', (event) => {
    const moduleName = event.path
    d('attempting to reload ', moduleName)
    System.reload(moduleName).catch((err) => moduleNotFound(moduleName))
})

io.on('disconnect', () => {
    d('hot reload disconnected from ', backendURL)
})

const moduleNotFound = (moduleName) => {
    if (moduleName.endsWith('.css')) {
        const newLink = document.createElement('link')
        newLink.type = 'text/css'
        newLink.rel = 'stylesheet'

        const links = document.getElementsByTagName('link')
        Object.keys(links).forEach(index => {
            const link = links[index]
            // Find the <link> that holds the CSS file, and replace it with the new node.
            // We add a `#` and random value to force a refresh of the CSS.
            let oldHref = link.href
            if (oldHref.indexOf('#') !== -1) {
                oldHref = oldHref.substr(0, oldHref.indexOf('#'))
            }
            if (oldHref.endsWith(moduleName)) {
                const newHash = Math.round(Math.random() * 1e10)
                const baseUrl = oldHref.substr(0, oldHref.indexOf(moduleName))
                newLink.href = `${baseUrl}${moduleName}#${newHash}`
                link.parentNode.replaceChild(newLink, link)
            }
        })
    }
}
