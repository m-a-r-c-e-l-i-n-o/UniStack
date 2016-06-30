import React from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App'
import _404 from './components/404'
import HelloWorld from './components/HelloWorld'
import TodoApp from './components/TodoApp'

const routes = (
    <Route path="/" component={App}>
        <IndexRoute component={HelloWorld}/>
        <Route path="to-do" component={TodoApp} />
        <Route path="*" component={_404} />
    </Route>
)

export { App, routes }
