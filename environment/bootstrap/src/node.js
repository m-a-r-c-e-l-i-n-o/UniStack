import 'source-map-support/register.js'
import * as fs from 'fs'
import * as path from 'path'
import Koa from 'koa'
import KoaSend from 'koa-send'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { Provider } from 'react-redux'
import { match, RouterContext } from 'react-router'
import createSharedStore from './store.js'
import Routes from './routes.js'
import reducers from './reducers/index.js'
import Layout from './layout.js'

const app = new Koa()

const renderHTML = (componentProps) => {
    const store = createSharedStore()
    const componentHTML = renderToString(
        <Provider store={store}>
            <RouterContext {...componentProps} />
        </Provider>
    )
    const state = store.getState()
    const pageAssets = state.pageAssets
    const title = pageAssets.title
    const bodyScripts = [
        { src: '/bootstrap/jspm_packages/system.src.js' },
        { src: '/bootstrap/jspm.config.js' },
        { innerHTML: `window.__UNISTACK_STATE__ =  ${JSON.stringify(state)}` },
        { innerHTML: 'System.trace = true; System.import("unistack/browser.js")' },
        ...pageAssets.bodyScripts
    ]
    const layoutHTML =
    '<!DOCTYPE html public="UniStackJS">' +
    renderToStaticMarkup(
        <Layout
            title={title}
            bodyScripts={bodyScripts}
            componentHTML={componentHTML}
        >
        </Layout>
    )
    return layoutHTML
}

const matchRoute = (location) => {
    return new Promise((resolve, reject) => {
        match({ routes: Routes, location }, (error, redirect, renderProps) => {
            resolve({ error, redirect, renderProps })
        })
    })
}

const router = async (ctx, next) => {
    const { error, redirect, renderProps } = await matchRoute(ctx.path)
    let componentProps
    if (error) {
        ctx.status = 500
        componentProps = error.message // CHANGE THIS TO A COMPONENT!!!
    } else if (redirect) {
        ctx.status = 302
        ctx.redirect(redirect.pathname + redirect.search)
    } else if (renderProps) {
        ctx.status = 200
        const lastComponent = renderProps.components.length - 1
        if (renderProps.components[lastComponent].name === 'PageNotFound') {
            const found = await KoaSend(ctx, ctx.path, {
                root: process.cwd()
            })
            if (found) {
               return next()
            }
            ctx.status = 404
        }
        componentProps = renderProps
    } else {
        ctx.status = 404
        ctx.body = 'Just empty.'
        return next()
    }
    ctx.body = renderHTML(componentProps)
    return next()
}

app.use(router)

export const serve = new Promise((resolve, reject) => {
    const server = app.listen(8080, () => {
        console.log('@@@@@@@@@@@@: Open browser to: http://localhost:8080')
        resolve(server)
    })
})

export const environment = process.env.NODE_ENV
