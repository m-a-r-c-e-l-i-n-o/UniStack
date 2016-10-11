import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Layout from './components/layout.js'
import Index from './components/pages/index.js'
import About from './components/pages/about.js'
import PageNotFound from './components/pages/page-not-found.js'

const routes = (
    <Route path="/" component={Layout}>
        <IndexRoute component={Index} />
        <Route path="about(/:code)" component={About} />
        <Route path="*" component={PageNotFound} />
    </Route>
)

export default routes
