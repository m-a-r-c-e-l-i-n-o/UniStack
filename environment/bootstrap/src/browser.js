import './browser/reloader.js'
import React from 'react'
import ReactDOM from 'react-dom'
import PageAssets from './components/containers/page-assets.js'
import { Router, browserHistory } from 'react-router'
import routes from 'app/routes.js'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import createSharedStore from './store.js'
import deepForceUpdate from 'react-deep-force-update';

const initialState = window.__UNISTACK__.state
const devTools = window.devToolsExtension ? window.devToolsExtension() : f => f
const container = document.getElementById('unistack')
const store = createSharedStore(initialState, devTools)
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
    <Provider store={store}>
        <div>
            <PageAssets/>
            <Router history={history}>
                {routes}
            </Router>
        </div>
    </Provider>,
    container
)

// Hot Reloader
export function __reload() {}
export function __unload() { ReactDOM.unmountComponentAtNode(container) }
