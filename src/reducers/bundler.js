import {
    CLEAR_BROADCASTER_PREPARATIONS,
    CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS,
    SET_BUNDLER_UPDATE_PREPARATIONS,
    CLEAR_BUNDLER_UPDATE_PREPARATIONS,
    CLEAR_NEWLY_MODIFIED_FILE_FLAG,
    SET_WATCHER_MODIFIED_FILE,
    SET_BUNDLER_NODE_ONLY_FILE_MODIFIED,
    SET_BUNDLER_INVALID_FILE,
    CLEAR_BUNDLER_INVALID_FILE,
    CLEAR_BUNDLER_PENDING_REQUEST,
    SET_BUNDLER_ERROR_PREPARATIONS
} from '../constants/actionTypes.js'

const initialState = {
    initial: true,
    update: false,
    updating: false,
    invalidFile: null,
    filesInvalidated: false,
    modifiedFile: null,
    pendingRequest: true
}

const bundler = (bundler = initialState, { type, payload }) => {
    switch (type) {
        case CLEAR_BROADCASTER_PREPARATIONS:
            return  {
                ...bundler,
                update: true
            }
        case SET_BUNDLER_INVALID_FILE:
            return  {
                ...bundler,
                invalidFile: payload,
                updating: false
            }
        case CLEAR_BUNDLER_INVALID_FILE:
            return  {
                ...bundler,
                invalidFile: null,
                modifiedFile: null,
                pendingRequest: true
            }
        case SET_BUNDLER_NODE_ONLY_FILE_MODIFIED:
        case CLEAR_NEWLY_MODIFIED_FILE_FLAG:
            return  {
                ...bundler,
                modifiedFile: null,
                pendingRequest: true
            }
        case CLEAR_BUNDLER_PENDING_REQUEST:
            return  {
                ...bundler,
                filesInvalidated: true,
                pendingRequest: false
            }
        case SET_WATCHER_MODIFIED_FILE:
            return  {
                ...bundler,
                filesInvalidated: false,
                modifiedFile: { ...payload }
            }
        case SET_BUNDLER_UPDATE_PREPARATIONS:
            return  {
                ...bundler,
                updating: true
            }
        case SET_BUNDLER_ERROR_PREPARATIONS:
        case CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS:
        case CLEAR_BUNDLER_UPDATE_PREPARATIONS:
            return  {
                ...bundler,
                initial: false,
                updating: false,
                filesInvalidated: false
            }
        default:
            return bundler
    }
}

export default bundler
