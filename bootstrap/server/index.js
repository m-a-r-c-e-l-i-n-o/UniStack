import 'source-map-support/register.js#?ENV|development'
import * as ENV from 'ENV'
import * as fs from 'fs'
import Koa from 'koa'
import KoaSend from 'koa-send'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import { match, RouterContext } from 'react-router'
import createSharedStore from '../shared/store.js'
import { addTodoOptimistic } from 'environment/src/shared/actions/index.js'
import { routes } from 'environment/src/shared/routes.js'
import Layout from 'environment/src/server/components/layout.js'

let app = new Koa()
let title = 'Hello World!'

function MatchRoute(path) {
    return new Promise((resolve, reject) => {
        match({ routes, location: path }, (error, redirect, renderProps) => {
            resolve({ error, redirect, renderProps })
        })
    })
}

app.use( async (ctx, next) => {
    let componentProps
    const response = await MatchRoute(ctx.path)

    if (response.error) {
        ctx.status = 500
        componentProps = response.error.message // CHANGE THIS TO A COMPONENT!!!
    } else if (response.redirect) {
        ctx.status = 302
        ctx.redirect(response.redirect.pathname + response.redirect.search)
    } else if (response.renderProps) {
        ctx.status = 200
        const lastComponent = response.renderProps.components.length - 1
        if (response.renderProps.components[lastComponent].name === '_404') {
            const found = await KoaSend(ctx, ctx.path, {
                root: ENV.environment.directory
            })
            if (found) {
               return next()
            }
            ctx.status = 404
        }
        componentProps = response.renderProps
    }

    let store = createSharedStore();
    store.dispatch( addTodoOptimistic( 'Go eat!' ) )
    let componentHTML = renderToString(
        <Provider store={store}>
            <RouterContext {...componentProps} />
        </Provider>
    )
    let layoutHTML =
        '<!DOCTYPE html public="UniStackJS">' +
        renderToStaticMarkup(
            <Layout
                title={title}
                componentHTML={componentHTML}
                initialState={store.getState()}
            >
            </Layout>
        )
    ctx.body = layoutHTML;
    next()
} )
const server = app.listen(ENV.serverPort, () => { /* server is ready */ })
const exportObj = {
    server: server,
    environment: process.env.NODE_ENV
}

export default exportObj
