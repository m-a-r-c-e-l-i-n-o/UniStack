import {
    __UNISTACK__SET_PAGE_TITLE,
    __UNISTACK__SET_PAGE_BODY_SCRIPTS
} from 'unistack/constants/actionTypes.js'

const initialState = {
    title: 'App',
    bodyScripts: [
        { src: '/dist/js/helloworld.js' },
        { src: '/dist/js/helloworld2.js' }
    ]
}

const pageAssets = (pageAssets = initialState, { type, payload }) => {
    switch (type) {
        case __UNISTACK__SET_PAGE_TITLE:
            return {
                ...pageAssets,
                title: `${initialState.title} - ${payload}`
            }
        case __UNISTACK__SET_PAGE_BODY_SCRIPTS:
            return {
                ...pageAssets,
                bodyScripts: [
                    ...payload
                ]
            }
        default:
            return pageAssets
    }
}

export default pageAssets
