if ( process.env.NODE_ENV === 'development' ) {
    console.log( 'unistack:importing-modules' )
}

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

if ( process.env.NODE_ENV === 'development' ) {
    console.log( 'unistack:running-app-code' )
}

let app = new Koa()
let title = 'Hello World!'

if ( process.env.NODE_ENV === 'development' ) {
    app.use( async ( ctx, next ) =>
        ( ctx.path.indexOf( '/testing-client.js' ) === 0 ?
            await KoaSend( ctx, ctx.path ) :
            next()
        )
    )
    app.use( async ( ctx, next ) =>
        ( ctx.path.indexOf( '/jspm_packages' ) === 0 ?
            await KoaSend( ctx, ctx.path ) :
            next()
        )
    )
    app.use( async ( ctx, next ) =>
        ( ctx.path.indexOf( '/jspm.browser.js' ) === 0 ?
            await KoaSend( ctx, ctx.path ) :
            next()
        )
    )
    app.use( async ( ctx, next ) =>
        ( ctx.path.indexOf( '/jspm.config.js' ) === 0 ?
            await KoaSend( ctx, ctx.path ) :
            next()
        )
    )
    app.use( async ( ctx, next ) =>
        ( ctx.path.indexOf( '/src/client/' ) === 0 ?
            await KoaSend( ctx, ctx.path ) :
            next()
        )
    )
    app.use( async ( ctx, next ) =>
        ( ctx.path.indexOf( '/src/shared/' ) === 0 ?
            await KoaSend( ctx, ctx.path ) :
            next()
        )
    )
    app.use( async ( ctx, next ) =>
        ( ctx.path.indexOf( '/env.client.dev.js' ) === 0 ?
            await KoaSend( ctx, ctx.path ) :
            next()
        )
    )
}
app.use( async ( ctx, next ) =>
    ( ctx.path.indexOf( '/favicon.ico' ) === 0 ?
        await KoaSend( ctx, ctx.path ) :
        next()
    )
)
app.use( async ( ctx, next ) => {

    var componentProps

    match( { routes, location: ctx.path }, ( error, redirect, renderProps ) => {
        if ( error ) {
            ctx.status = 500
            componentProps = error.message // CHANGE THIS TO A COMPONENT!!!
        } else if ( redirect ) {
            ctx.status = 302
            ctx.redirect(redirect.pathname + redirect.search)
        } else if ( renderProps ) {
            ctx.status = 200
            if ( renderProps
                .components[ renderProps.components.length - 1 ]
                .name === '_404' ) ctx.status = 404

            componentProps = renderProps
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
    } )
} )
if ( process.env.NODE_ENV === 'development' ) {
    console.log( 'unistack:app-server-loading' )
}
const server = app.listen( ENV.serverPort, () => {
    if ( process.env.NODE_ENV === 'development' ) {
        console.log( 'unistack:app-server-loaded' )
    }
} )
const exportObj = {
    server: server,
    environment: process.env.NODE_ENV
}

export default exportObj
