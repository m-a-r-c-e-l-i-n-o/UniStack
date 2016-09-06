import './browser/reloader.js'
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, browserHistory } from 'react-router'
import routes from './routes'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import createSharedStore from './store.js'
import deepForceUpdate from 'react-deep-force-update';

const initialState = window.__INITIAL_STATE__
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
export function __reload() {}
export function __unload() { ReactDOM.unmountComponentAtNode(container) }
