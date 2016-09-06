import {
    UNISTACK_SET_PAGE_TITLE,
    UNISTACK_SET_PAGE_BODY_SCRIPTS,
    UNISTACK_SET_DEV_BODY_SCRIPTS,
    UNISTACK_APPEND_TO_BODY_SCRIPTS
} from '../constants/actionTypes.js'

const initialState = {
    title: 'Hello World!',
    bodyScripts: [
        { src: 'helloworld.js' },
        { src: 'helloworld2.js' }
    ]
}

const pageAssets = (pageAssets = initialState, { type, payload }) => {
    switch (type) {
        case UNISTACK_SET_PAGE_TITLE:
            return {
                ...pageAssets,
                title: payload
            }
        case UNISTACK_SET_PAGE_BODY_SCRIPTS:
            return {
                ...pageAssets,
                bodyScripts: [
                    ...payload
                ]
            }
        case UNISTACK_APPEND_TO_BODY_SCRIPTS:
            return {
                ...pageAssets,
                bodyScripts: [
                    ...pageAssets.bodyScripts,
                    ...payload
                ]
            }
        default:
            return pageAssets
    }
}

export default pageAssets
