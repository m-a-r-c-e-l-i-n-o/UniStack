import templateText from './templated-text.js'
import {
    KEY_NOT_REGISTERED_ERROR
} from '../constants/language/helpers/create-local-state.js'

const createLocalState = (initialState) => {
    const state = Object.assign({}, initialState)
    return {
        set: (key, value) => setValue(key, value, state),
        get: function (key) {
            if (arguments.length === 0) return Object.assign({}, state)
            return getValue(key, state)
        }
    }
}

const setValue = (key, value, state) => {
    if (!(key in state)) throw makeUnregisteredKeyError(key)
    const oldValue = state[key]
    state[key] = value
    return oldValue
}

const getValue = (key, state) => {
    if (!(key in state)) throw makeUnregisteredKeyError(key)
    return state[key]
}

const makeUnregisteredKeyError = (key) => {
    const template = {'KEY': key}
    const errorMessage = templateText(KEY_NOT_REGISTERED_ERROR, template)
    return new Error(errorMessage)
}

export default createLocalState
