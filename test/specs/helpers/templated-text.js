import templatedText from '../../../src/helpers/templated-text.js'
import { MISMATCH_ERROR } from '../../../src/constants/language/helpers/templated-text.js'

describe ('templatedText()', () => {
    it ('should throw error is first parameter is not a string', () => {
        const errorMessage = 'Failed to create templated text.\n' +
        'The first (text) parameter has to be a plain string, but received:\n'
        const undefinedInputError = errorMessage + '"[object Undefined]"'
        expect(() => templatedText()).toThrowError(undefinedInputError)
        const nullInputError = errorMessage + '"[object Null]"'
        expect(() => templatedText(null)).toThrowError(nullInputError)
        const numberInputError = errorMessage + '"[object Number]"'
        expect(() => templatedText(1)).toThrowError(numberInputError)
        const arrayInputError = errorMessage + '"[object Array]"'
        expect(() => templatedText([])).toThrowError(arrayInputError)
        const objectInputError = errorMessage + '"[object Object]"'
        expect(() => templatedText({})).toThrowError(objectInputError)
    })
    it ('should return the input text', () => {
        const input = 'Hello World'
        expect(templatedText(input)).toBe(input)
    })
    it ('should return the input text even if template is irrelevant', () => {
        const input = 'Hello World'
        expect(templatedText(input, { 'INEXISTENT': 'placeholder' })).toBe(input)
    })
    it ('should return the input with the appropiate substitutions', () => {
        const input = 'Hello {{NOUN}}, {{ADJECTIVE}}!'
        const substitutions = {
            'NOUN': 'there',
            'ADJECTIVE': 'handsome'
        }
        expect(templatedText(input, substitutions)).toBe('Hello there, handsome!')
    })
    it ('should throw error when substitutions are incorrect', () => {
        const input = 'Hello {{NOUN}}!'
        const substitutions = {
            'ADJECTIVE': 'handsome'
        }
        expect(() => templatedText(input, substitutions)).toThrowError(
            'Failed to create templated text.\n' +
            'The following template place holders are missing or not valid:\n' +
            '"NOUN"\n' +
            'Valid places holders: "NOUN"\n' +
            '* Remember, the place holders\' text should be all uppercase!'
        )
    })
})
