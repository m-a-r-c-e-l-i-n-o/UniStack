import React from 'react'
import { graphql } from 'graphql'
import uniwindow from '../#{unistats|platform}/uniwindow.js'
import { match } from 'react-router'
import { platform, environment } from '../unistats.js'
import Page from '../components/page.js'
import apiRoutes from 'app/node/api/routes.js'
import parsePost from 'parse-post'

export const initialRender = () => (uniwindow.__UNISTACK__.initialRender)
export const createPage = (component) => Page(component)
export const createWrapper = (component) => Page(component, { wrapper: true })

export const unescapeReactHTML = (ownProps) => {
    const { children, ...props } = ownProps
    if (!children) return ownProps
    return { ...props, dangerouslySetInnerHTML: { __html: children }}
}

export const resolveContainer = (componentHTML) => (
    <div id="unistack" dangerouslySetInnerHTML={{ __html: componentHTML }} />
)

export const resolveScripts = (scripts, config) => {
    const { entry, ...state } = config
    if (environment === 'production') return scripts
    const inline = `
        window.__UNISTACK__ = ${JSON.stringify(state)};
        System.trace = true;
        System.import("unistack/${entry}.js").then(function () {
            window.__UNISTACK__.initialRender = false;
            console.log('Local components are now synced with server rendered components.')
        }).catch(e => console.log(e));
    `
    return [
        <script src="/bootstrap/jspm_packages/system.src.js" key="1" unistack />,
        <script src="/bootstrap/jspm.config.js" key="2" unistack />,
        <script key="3" dangerouslySetInnerHTML={{ __html: inline }} />,
        ...scripts.map(shallowObjectsToJSX)
    ]
}

export const resolveTitle = (baseTitle, title) => {
    const { children: baseValue } = baseTitle
    const { children: value } = title
    if (typeof baseValue === 'string') {
        return { ...title, children: baseValue.replace('%s', value) }
    }
    return title
}

export const jsxToShallowObject = component => {
    const { children, ...props } = component.props
    const plain = { ...props, type: component.type }
    if (typeof children === 'string') return { ...plain, children }
    return plain
}

export const shallowObjectToJSX = (props, key) => {
    const { type: Type, ...ownProps } = props
    return <Type {...{...unescapeReactHTML(ownProps), key }} />
}

export const shallowObjectsToJSX = objects => {
    return [].concat(objects).map(object => shallowObjectToJSX(object))
}

export const jsxCollectionToShallowObject = collection => {
    return [].concat(collection).map(jsxToShallowObject)
}

export const matchRoute = (routes, location) => {
    return new Promise((resolve, reject) => {
        match({ routes, location }, (error, redirect, renderProps) => {
            resolve({ error, redirect, renderProps })
        })
    })
}

export const resolveGraphQL = (requestBody, schema) => {
    const requests = [].concat(requestBody).map(body => (
        graphql(schema, body.query)
    ))
    return Promise.all(requests).then(result => JSON.stringify(result, null, 2))
}

const parseBody = (req, res, method) => (
    new Promise((resolve, reject) => (
        parsePost.config({ parser: JSON.parse })(resolve)(req, res)
    ))
)

export const tryAPI = async ({ req, res, request, response = {} }) => {
    const { method, url } = request
    const { renderProps: api } = await matchRoute(apiRoutes, url)

    if (api) {
        if (req && res && method.toLowerCase() === 'post') {
            await parseBody(req, res, method)
            request.body = req.body
        }

        const ctx = {
            request,
            params: api.params,
            pathname: api.pathname,
            search: api.location.search,
            query: api.location.query
        }
        const result = api.components[api.components.length-1](ctx)
        if (!url.startsWith('/api/graphql')) return response.body = result

        const { body } = request
        const query = (typeof body === 'string' ? JSON.parse(body) : body)
        return response.body = await resolveGraphQL(query, result)
    }
}

