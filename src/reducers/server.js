import {
    CLEAR_BUNDLER_PENDING_REQUEST,
    CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS,
    SET_BUNDLER_NODE_ONLY_FILE_MODIFIED,
    CLEAR_BUNDLER_UPDATE_PREPARATIONS,
    SET_SERVER_RESTART_PREPARATION,
    CLEAR_SERVER_RESTART_PREPARATION
} from '../constants/actionTypes.js'

const initialState = {
    restart: false,
    worthRestartingNow: true
}

const server = (server = initialState, { type, payload }) => {
    switch (type) {
        case SET_BUNDLER_NODE_ONLY_FILE_MODIFIED:
            return {
                ...server,
                worthRestartingNow: true
            }
        case CLEAR_BUNDLER_PENDING_REQUEST:
            return {
                ...server,
                restart: false
            }
        case CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS:
        case CLEAR_BUNDLER_UPDATE_PREPARATIONS:
            return {
                ...server,
                restart: true
            }
        case SET_SERVER_RESTART_PREPARATION:
            return {
                ...server,
                worthRestartingNow: false
            }
        case CLEAR_SERVER_RESTART_PREPARATION:
            return {
                ...server,
                restart: false,
                worthRestartingNow: false
            }
        default:
            return server
    }
}

export default server
