import {
    SET_PAGE_BASE_TITLE,
    SET_PAGE_TITLE,
    SET_PAGE_STYLES,
    SET_PAGE_BODY_SCRIPTS,
    SET_PAGE_INITIAL_RENDER
} from '../actions/types.js'
import { resolveTitle } from '../helpers/helpers.js'

const initialState = {
    baseTitle: { type: 'title', children: 'UniStack' },
    title: { type: 'title', children: '' },
    styles: [],
    updateStyles: false,
    scripts: [],
    updateScripts: false,
    initial: true
}

const page = (page = initialState, { type, payload }) => {
    switch (type) {
        case SET_PAGE_INITIAL_RENDER:
            return { ...page, initial: payload }
        case SET_PAGE_BASE_TITLE:
            return { ...page, baseTitle: payload }
        case SET_PAGE_TITLE:
            return {
                ...page,
                title: resolveTitle(page.baseTitle, payload)
            }
        case SET_PAGE_STYLES:
            return {
                ...page,
                updateStyles: true,
                styles: [
                    ...payload
                ]
            }
        case SET_PAGE_BODY_SCRIPTS:
            return {
                ...page,
                updateScripts: true,
                scripts: [
                    ...payload
                ]
            }
        default:
            return page
    }
}

export default page
