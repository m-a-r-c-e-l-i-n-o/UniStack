import {
    TOGGLE_WATCHING_REJECTIONS_FLAG,
    HANDLE_ERROR
} from '../constants/actionTypes.js'

const initialState = {
    fatal: null,
    instance: null,
    watchingRejections: null
}

const error = (error = initialState, { type, payload }) => {
    switch (type) {
        case HANDLE_ERROR:
            return {
                ...error,
                instance: payload.error,
                fatal: payload.fatal
            }
        case TOGGLE_WATCHING_REJECTIONS_FLAG:
            return {
                ...error,
                watchingRejections: !error.watchingRejections
            }
        default:
            return error
    }
}

export default error
