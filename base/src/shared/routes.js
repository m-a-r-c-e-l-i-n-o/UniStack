import React from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App.js'
import _404 from './components/404.js'
import HelloWorld from './components/HelloWorld.js'

const routes = (
    <Route path="/" component={App}>
        <IndexRoute component={HelloWorld}/>
        <Route path="*" component={_404} />
    </Route>
)

export { App, routes } // UniStack(1): Do Not Remove
