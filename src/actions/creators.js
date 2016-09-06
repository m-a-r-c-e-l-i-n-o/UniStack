import templatedText from '../helpers/templated-text.js'
import {
    UNKNOWN_ENV_SERVER_SHUT_DOWN_ERROR
} from '../constants/language/errors.js'
import {
    HANDLE_ERROR,
    SET_ENV_FILES_PRESENT_FLAG,
    SET_ENV_POPULATED_FLAG,
    SET_BUNDLER_INVALID_FILE,
    SET_WATCHER_MODIFIED_FILE
} from '../constants/actionTypes.js'

export const handleError = (error, { message, fatal } = {}) => {
    fatal = fatal || false
    if (message) {
        const customErrorMessage = templatedText(message, {
            'ERROR': `${error.message}\n${error.stack}`
        })
        error = new Error(customErrorMessage)
        Error.captureStackTrace(error, handleError)
    }
    return { type: HANDLE_ERROR, payload: { error, fatal } }
}

export const setEnvPopulatedFlag = (status) => {
    return { type: SET_ENV_POPULATED_FLAG, payload: status }
}

export const setEnvFilesPresentFlag = (status) => {
    return { type: SET_ENV_FILES_PRESENT_FLAG, payload: status }
}

export const setBundlerInvalidFile = (invalid) => {
    return { type: SET_BUNDLER_INVALID_FILE, payload: invalid }
}

export const setWatcherModifiedFile = (file) => {
    return { type: SET_WATCHER_MODIFIED_FILE, payload: file }
}
