import {
    __UNISTACK__SET_PAGE_TITLE,
    __UNISTACK__SET_PAGE_BODY_SCRIPTS
} from '../constants/actionTypes.js'

export const setPageTitle = (payload) => (
    { type: __UNISTACK__SET_PAGE_TITLE, payload }
)

export const setPageBodyScripts = (payload) => (
    { type: __UNISTACK__SET_PAGE_BODY_SCRIPTS, payload }
)
