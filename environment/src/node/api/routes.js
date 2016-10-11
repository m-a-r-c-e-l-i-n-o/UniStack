import React from 'react'
import { Route } from 'react-router'
import GraphQL from './graphql/graphql.js'
import v0_0_0_message from './restful/v0.0.0/message.js'

const routes = (
    <Route path="api">
        <Route path="graphql" component={GraphQL}/>
        <Route path="v0.0.0">
            <Route path="message" component={v0_0_0_message}/>
        </Route>
    </Route>
)

export default routes

