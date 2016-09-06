import templateText from '../../../src/helpers/templated-text.js'
import createLocalState from '../../../src/helpers/create-local-state.js'
import {
    KEY_NOT_REGISTERED_ERROR
} from '../../../src/constants/language/helpers/create-local-state.js'

describe ('localState()', () => {
    it ('should return the state', () => {
        const initialState = { hello: 'world' }
        const localState = createLocalState(initialState)
        expect(localState.get()).toEqual(initialState)
        expect(localState.get()).not.toBe(initialState)
    })
    it ('should throw error when setting keys without an initial state', () => {
        const localState = createLocalState()
        const key = 'unregistered'
        const message = templateText(KEY_NOT_REGISTERED_ERROR, { 'KEY': key })
        expect(() => localState.set(key, 'value')).toThrowError(message)
    })
    it ('should throw error when getting keys without an initial state', () => {
        const localState = createLocalState()
        const key = 'unregistered'
        const message = templateText(KEY_NOT_REGISTERED_ERROR, { 'KEY': key })
        expect(() => localState.get(key, 'value')).toThrowError(message)
    })
    it ('should retrieve a value', () => {
        const key = 'key'
        const localState = createLocalState({ key })
        expect(localState.get(key)).toBe(key)
    })
    it ('should store a new value', () => {
        const key = 'key'
        const value = 'value'
        const localState = createLocalState({ key })
        localState.set(key, value)
        expect(localState.get(key)).toBe(value)
    })
    it ('should return the old value when setting the new', () => {
        const key = 'key'
        const value = 'value'
        const localState = createLocalState({ key })
        expect(localState.set(key, value)).toBe(key)
    })
    it ('should retrieve falsy values', () => {
        const key = 'key'
        const localState = createLocalState({ key })
        let value
        localState.set(key, value = undefined)
        expect(localState.get(key)).toBe(value)
        localState.set(key, value = null)
        expect(localState.get(key)).toBe(value)
        localState.set(key, value = false)
        expect(localState.get(key)).toBe(value)
        localState.set(key, value = 0)
        expect(localState.get(key)).toBe(value)
        localState.set(key, value = '')
        expect(localState.get(key)).toBe(value)
        localState.set(key, value = NaN)
        expect(localState.get(key)).toEqual(value)
    })
})
