import HotReloader from './reloader.js#?ENV|development'
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, browserHistory } from 'react-router'
import { App, routes } from '../shared/routes'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import createSharedStore from '../shared/store'

const store = createSharedStore(
    window.__INITIAL_STATE__,
    window.devToolsExtension ? window.devToolsExtension() : f => f
);
const history = syncHistoryWithStore( browserHistory, store );
const rootDOMNode = document.getElementById( 'container' );

if ( rootDOMNode ) {
    ReactDOM.render(
        <Provider store={store}>
            <Router history={history}>
                {routes}
            </Router>
        </Provider>,
        rootDOMNode
    )
}

export { App }

// Hot Reloader
export function __reload( m ) { if ( m.App.state ) App.setState( m.component.state ) }
export function __unload() { ReactDOM.unmountComponentAtNode( rootDOMNode ) }
