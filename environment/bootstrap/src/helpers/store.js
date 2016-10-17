import 'isomorphic-fetch'
import thunk from 'redux-thunk'
import { routerReducer } from 'react-router-redux'
import appReducers from 'app/reducers/index.js'
import { platform } from '../uni.js'
import reducers from '../reducers/index.js'
import DomRebel from '../components/dom-rebel.js'
import {
    jsxToShallowObject, jsxCollectionToShallowObject, tryAPI
} from './helpers.js'
import {
    createStore as reduxCreateStore, combineReducers, applyMiddleware
} from 'redux'
import {
    setPageBaseTitle,
    setPageTitle,
    setPageScripts,
    setGraphQLRequest,
    setGraphQLPromise,
    setPageInitialRender
} from '../actions/creators.js'
import { CLEAR_GRAPHQL_STATE } from '../actions/types.js'

export const createHelpers = () => {
    const store = createStore(reducers)
    const { dispatch, getState } = store

    const page = () => getState().page

    const initial = (...args) => {
        if (platform === 'browser') {
            return window.__UNISTACK__.initialRender
        }
        if (args.length === 0) return getState().page.initial
        const [ value ] = args
        dispatch(setPageInitialRender(value))
    }

    const baseTitle = (...args) => {
        if (args.length === 0) return getState().page.baseTitle
        const [ titleElement ] = args
        dispatch(setPageBaseTitle(jsxToShallowObject(titleElement)))
    }

    const title = (...args) => {
        if (args.length === 0) return getState().page.title
        const [ title ] = args
        dispatch(setPageTitle(jsxToShallowObject(title)))
    }

    const scripts = (...args) => {
        if (args.length === 0) return getState().page.scripts
        const [ scripts ] = args
        dispatch(setPageScripts(jsxCollectionToShallowObject(scripts)))
    }

    const runRequest = (request) => {
        if (platform === 'node') {
            return new Promise((resolve, reject) => resolve(tryAPI({ request })))
            .then(results => JSON.parse(results))
        }
        return fetch(request).then(results => results.json())
    }

    const runGraphQLRequests = () => {
        const { requests, promises } = getState().graphql
        if (requests.length === 0 || promises.length === 0 ||
           (requests.length !== promises.length)) {
            return Promise.resolve(false)
        }
        dispatch({ type: CLEAR_GRAPHQL_STATE })
        const graphql = '/api/graphql'
        const headers = new Headers()
        headers.append('Content-Type', 'application/json')
        const request =  new Request(graphql, {
            method: 'POST',
            headers,
            body: JSON.stringify(requests.map(({ query, variables }) =>
                ({ query, variables })
            ))
        })
        return runRequest(request)
        .then(results => {
            results.forEach((result, index) => {
                if (result.error) return promises[index].reject(result)
                return promises[index].resolve(result)
            })
            return true
        })
        .catch(e => { console.log('runGraphQLRequests', e.stack) })
    }

    const graphQLRequest = (query, variables) => {
        dispatch(setGraphQLRequest({ query, variables }))
        return new Promise((resolve, reject) => {
            dispatch(setGraphQLPromise({ resolve, reject }))
        })
    }

    const request = (...args) => {
        if (args.length === 0) return runGraphQLRequests()
        const [ query, variables ] = args
        return graphQLRequest(query, variables)
    }

    const components = [DomRebel]
    components.forEach(component => store.subscribe(() => component(store)))

    return Object.freeze({ page, baseTitle, title, scripts, request, initial })
}

export const createSharedStore = (...args) => {
    const reducers = combineReducers({ ...appReducers, routing: routerReducer })
    const store = createStore(reducers, ...args)
    store.unihelpers = createHelpers()
    return store
}

export const createStore = (reducers, initialState, devTools) => {
    return applyMiddleware(thunk)(reduxCreateStore)(
        reducers,
        initialState,
        devTools
    )
}
