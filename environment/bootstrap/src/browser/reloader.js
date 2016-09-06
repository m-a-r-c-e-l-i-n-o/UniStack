import HotReloader from 'systemjs-hot-reloader/hot-reloader.js'

const hotReloader = new HotReloader( '//localhost:5776')

hotReloader.socket.on( 'connect', () => {
    console.log( 'Socket connected!' )
})

let name
hotReloader.on('change', _name => {
    console.log('Changed!')
    return name = _name
})

hotReloader.on( 'moduleRecordNotFound', _ => {
    console.log('Module not found', name)
    if (name.endsWith('.css')) {
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
            if (oldHref.endsWith(name)) {
                const newHash = Math.round(Math.random() * 1e10)
                const baseUrl = oldHref.substr(0, oldHref.indexOf(name))
                newLink.href = `${baseUrl}${name}#${newHash}`
                link.parentNode.replaceChild(newLink, link)
            }
        })
    }
})
