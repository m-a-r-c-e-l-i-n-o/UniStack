import {
    HANDLE_ERROR,
    CLEAR_SERVER_RESTART_PREPARATION,
    SET_WATCHER_MODIFIED_FILE,
    CLEAR_PACKAGER_INSTALLATION_PREPARATION,
    SET_BROADCASTER_PREPARATIONS,
    CLEAR_BROADCASTER_PREPARATIONS,
    CLEAR_BROADCASTER_MESSAGE,
    CLEAR_BROADCASTER_FILE_CHANGE,
    CLEAR_BROADCASTER_RELOAD
} from '../constants/actionTypes.js'

const initialState = {
    broadcast: false,
    broadcasting: false,
    fileChange: null,
    reload: false,
    message: null
}

const broadcaster = (broadcaster = initialState, { type, payload }) => {
    switch (type) {
        case CLEAR_SERVER_RESTART_PREPARATION:
            return {
                ...broadcaster,
                reload: true
            }
        case CLEAR_BROADCASTER_RELOAD:
            return {
                ...broadcaster,
                reload: false
            }
        case HANDLE_ERROR:
            return {
                ...broadcaster,
                message: payload.error.stack
            }
        case CLEAR_BROADCASTER_MESSAGE:
            return {
                ...broadcaster,
                message: null
            }
        case SET_WATCHER_MODIFIED_FILE:
            return {
                ...broadcaster,
                fileChange: { ...payload }
            }
        case CLEAR_BROADCASTER_FILE_CHANGE:
            return {
                ...broadcaster,
                fileChange: null
            }
        case CLEAR_PACKAGER_INSTALLATION_PREPARATION:
            return {
                ...broadcaster,
                broadcast: true
            }
        case SET_BROADCASTER_PREPARATIONS:
            return {
                ...broadcaster,
                broadcast: false
            }
        case CLEAR_BROADCASTER_PREPARATIONS:
            return {
                ...broadcaster,
                broadcasting: true
            }
        default:
            return broadcaster
    }
}

export default broadcaster
