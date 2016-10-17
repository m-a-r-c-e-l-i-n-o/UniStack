import {
    SET_PAGE_BASE_TITLE,
    SET_PAGE_TITLE,
    SET_PAGE_STYLES,
    SET_PAGE_BODY_SCRIPTS,
    SET_PAGE_BASE_BODY_SCRIPTS,
    SET_GRAPH_QL_REQUEST,
    SET_GRAPH_QL_PROMISE,
    SET_PAGE_INITIAL_RENDER
} from './types.js'

export const setPageBaseTitle = (payload) => (
    { type: SET_PAGE_BASE_TITLE, payload }
)

export const setPageTitle = (payload) => (
    { type: SET_PAGE_TITLE, payload }
)

export const setPageStyles = (payload) => (
    { type: SET_PAGE_STYLES, payload }
)

export const setPageScripts = (payload) => (
    { type: SET_PAGE_BODY_SCRIPTS, payload }
)

export const setGraphQLPromise = (payload) => (
    { type: SET_GRAPH_QL_PROMISE, payload }
)

export const setGraphQLRequest = (payload) => (
    { type: SET_GRAPH_QL_REQUEST, payload }
)

export const setPageInitialRender = (payload) => (
    { type: SET_PAGE_INITIAL_RENDER, payload }
)
