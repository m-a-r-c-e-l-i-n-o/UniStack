import 'source-map-support/register.js'
import * as fs from 'fs'
import * as path from 'path'
import React from 'react'
import Koa from 'koa'
import KoaSend from 'koa-send'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import { Provider } from 'react-redux'
import routes from 'app/routes.js'
import BaseLayout from 'app/components/base-layout.js'
import apiRoutes from 'app/node/api/routes.js'
import reducers from './reducers/index.js'

import {
    jsxCollectionToShallowObject,
    jsxToShallowObject,
    shallowObjectsToJSX,
    shallowObjectToJSX,
    createSharedStore,
    resolveContainer,
    resolveScripts,
    matchRoute,
    tryAPI
} from './unihelpers.js'

const app = new Koa()

const getUtility = (utility) => {
    switch(utility) {
        case 'graphiql': return renderGraphiQL()
        default: return renderUtilityList()
    }
}

const mergeBaseStyle = (styles = []) => {
    if (!Array.isArray(styles)) styles = []
    const result = jsxCollectionToShallowObject([
        <link key="1" rel="stylesheet" href="/bootstrap/src/browser/__unistack__/utilities.css"/>,
        ...styles
    ])
    return result
}

const renderUtilityList = () => ({
    entry: 'browser/__unistack__/utilities',
    title: jsxToShallowObject(<title>Unistack - Utilities</title>)
})

const renderGraphiQL = () => ({
    entry: 'browser/__unistack__/graphiql',
    title: jsxToShallowObject(<title>Unistack - Utilities - GraphiQL</title>),
    styles: [
        <link key="2" rel="stylesheet" href="/bootstrap/jspm_packages/npm/graphiql@0.7.8/graphiql.css"/>
    ]
})

const renderUtilities = utility => {
    const props = getUtility(utility)
    return {
        componentHTML: 'Loading...',
        ...props,
        styles: mergeBaseStyle(props.styles)
    }
}
const renderComponentHTML = (store, componentProps) => (
    renderToString(
        <Provider store={store}>
            <RouterContext {...componentProps} />
        </Provider>
    )
)

const renderComponents = (componentProps) => {
    const store = createSharedStore()
    const syncComponentHTML = renderComponentHTML(store, componentProps)
    return store.unihelpers.request().then(requests => {
        const page = store.unihelpers.page()
        const componentHTML = (
            requests ?
            renderComponentHTML(store, componentProps) :
            syncComponentHTML
        )
        return { ...page, state: store.getState(), componentHTML }
    })
}

const renderPageHTML = (page, debug) => {
    const {
        entry = 'browser',
        title = '',
        state = {},
        styles = [],
        scripts = [],
        componentHTML = null
    } = page
    const config = { initialRender: true, entry, state }
    const pageHTML =
        '<!DOCTYPE html public="UniStackJS">' +
        renderToStaticMarkup(
            <BaseLayout
                title={shallowObjectToJSX(title)}
                styles={shallowObjectsToJSX(styles)}
                scripts={resolveScripts(scripts, config)}
                unistack={resolveContainer(componentHTML)}
            >
            </BaseLayout>
        )
    return pageHTML
}

export const resolveRoute = async (ctx, next = () => {}) => {
    if (ctx.path.startsWith('/__unistack__') && ctx.path.indexOf('.') === -1) {
        // this, along with all the related methods should be abstracted out
        // into it's own spa application, and only include a ready made bundle
        ctx.status = 200
        const utility = ctx.path.replace('/__unistack__/', '')
        return ctx.body = renderPageHTML(renderUtilities(utility))
    }

    const response = await tryAPI(ctx)
    if (response !== undefined) return next()

    const { error, redirect, renderProps } = await matchRoute(routes, ctx.path)
    let componentProps
    if (error) {
        ctx.status = 500
        componentProps = error.message // CHANGE THIS TO A COMPONENT!!!
    } else if (redirect) {
        ctx.status = 302
        ctx.redirect(redirect.pathname + redirect.search)
    } else if (renderProps) {
        ctx.status = 200
        const components = renderProps.components
        const Component = components[components.length - 1].Component
        if (Component.name === 'PageNotFound') {
            const found = await KoaSend(ctx, ctx.path, { root: process.cwd() })
            if (found) return next()
            ctx.status = 404
        }
        componentProps = renderProps
    } else {
        ctx.status = 404
        ctx.body = 'Just empty.'
        return next()
    }

    await renderComponents(componentProps).then(componentHTML => {
        ctx.body = renderPageHTML(componentHTML)
        return next()
    })
    .catch(e => { console.log(e.stack) })
}

app.use(resolveRoute)

export const serve = new Promise((resolve, reject) => {
    const server = app.listen(8080, () => {
        console.log('@@@@@@@@@@@@: Open browser to: http://localhost:8080')
        resolve(server)
    })
})

export const environment = process.env.NODE_ENV
