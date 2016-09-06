import createStore from './helpers/create-store.js'
import Broadcaster from './components/broadcaster.js'
import Initiator from './components/initiator.js'
import Packager from './components/packager.js'
import Errorer from './components/errorer.js'
import Watcher from './components/watcher.js'
import Bundler from './components/bundler.js'
import Server from './components/server.js'

const init = () => {
    const store = createStore()
    const components = [
        Errorer, Initiator, Packager, Broadcaster, Watcher, Bundler, Server
    ]
    components.forEach(component => store.subscribe(() => component(store)))
    store.dispatch({ type: 'INIT' })
}

export { init }
