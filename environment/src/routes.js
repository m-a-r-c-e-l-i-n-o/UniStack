import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Wrapper from './components/wrapper.js'
import Index from './components/pages/index.js'
import About from './components/pages/about.js'
import PageNotFound from './components/pages/page-not-found.js'

const Routes = (
    <Route path="/" component={Wrapper}>
        <IndexRoute component={Index} />
        <Route path="about(/:code)" component={About} />
        <Route path="*" component={PageNotFound} />
    </Route>
)

export default Routes
