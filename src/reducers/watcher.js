import {
    CLEAR_BROADCASTER_PREPARATIONS,
    SET_WATCHER_PREPARATIONS,
    CLEAR_WATCHER_PREPARATIONS
} from '../constants/actionTypes.js'

const initialState = {
    watch: false,
    watching: false
}

const watcher = (watcher = initialState, { type, payload }) => {
    switch (type) {
        case CLEAR_BROADCASTER_PREPARATIONS:
            return {
                ...watcher,
                watch: true
            }
        case SET_WATCHER_PREPARATIONS:
            return {
                ...watcher,
                watch: false
            }
        case CLEAR_WATCHER_PREPARATIONS:
            return {
                ...watcher,
                watching: true
            }
        default:
            return watcher
    }
}

export default watcher
