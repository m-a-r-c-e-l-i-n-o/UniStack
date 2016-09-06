import {
    TOGGLE_ENV_INITIATED_FLAG,
    SET_ENV_FILES_PRESENT_FLAG,
    SET_ENV_POPULATED_FLAG,
    TOGGLE_PREPARE_TO_EXIT_FLAG
} from '../constants/actionTypes.js'

const initialState = {
    initiated: false,
    filesPresent: null,
    populated: null,
    prepareToExit: null
}

const env = (env = initialState, { type, payload }) => {
    switch (type) {
        case TOGGLE_ENV_INITIATED_FLAG:
            return {
                ...env,
                initiated : !env.initiated
            }
        case SET_ENV_FILES_PRESENT_FLAG:
            return {
                ...env,
                filesPresent: payload
            }
        case SET_ENV_POPULATED_FLAG:
            return {
                ...env,
                populated: payload
            }
        case TOGGLE_PREPARE_TO_EXIT_FLAG:
            return {
                ...env,
                prepareToExit: true
            }
        default:
            return env
    }
}

export default env
