import './browser/reloader.js'
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, browserHistory } from 'react-router'
import routes from 'app/routes.js'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import { createSharedStore } from './unihelpers.js'

const initialState = window.__UNISTACK__.state
const devTools = window.devToolsExtension ? window.devToolsExtension() : f => f
const container = document.getElementById('unistack')
const store = createSharedStore(initialState, devTools)
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            {routes}
        </Router>
    </Provider>,
    container
)

// Hot Reloader
export function __reload() { window.__UNISTACK__.initialRender = false }
export function __unload() {
    window.__UNISTACK__.initialRender = true
    window.__UNISTACK__.state = store.getState()
    ReactDOM.unmountComponentAtNode(container)
}

