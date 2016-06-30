if ( process.env.NODE_ENV === 'development' ) {
    process.stdout.write( 'unistack:importing-modules' )
}

import 'source-map-support/register.js#?ENV|development'
import ENV from 'ENV'
import * as fs from 'fs'
import Koa from 'koa'
import KoaSend from 'koa-send'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import { match, RouterContext } from 'react-router'
import createSharedStore from '../shared/store'
import { addTodoOptimistic } from '../shared/actions/index'
import { routes } from '../shared/routes'
import Layout from './components/Layout'

if ( process.env.NODE_ENV === 'development' ) {
    process.stdout.write( 'unistack:running-app-code' )
}

let app = new Koa()
let title = JSON.parse( fs.readFileSync( './package.json', 'utf8' ) ).jspm.title

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
                <Layout initialState={store.getState()}>
                    <head>
                        <meta charSet="utf-8" />
                        <title>{title}</title>
                        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                        <link rel="stylesheet" href="/src/client/css/main.css"/>
                    </head>
                    <body>
                    <div id="container">{componentHTML}</div>
                    </body>
                </Layout>
            )
        ctx.body = layoutHTML;
    } )
} )
if ( process.env.NODE_ENV === 'development' ) {
    process.stdout.write( 'unistack:app-server-loading' )
}
app.listen( ENV.serverPort, () => {
    if ( process.env.NODE_ENV === 'development' ) {
        process.stdout.write( 'unistack:app-server-loaded' )
    }
} )
