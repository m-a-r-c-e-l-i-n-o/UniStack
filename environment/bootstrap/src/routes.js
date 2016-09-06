import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Wrapper from './components/wrapper.js'
import Index from './components/pages/index.js'
import PageNotFound from './components/pages/page-not-found.js'

const Routes = (
    <Route path="/" component={Wrapper}>
        <IndexRoute component={Index} />
        <Route path="*" component={PageNotFound} />
    </Route>
)

export default Routes
