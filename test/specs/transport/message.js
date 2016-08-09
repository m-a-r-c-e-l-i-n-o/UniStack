import Config from '../../../config-tmp.js'
import Message from '../../../src/transport/message.js'

describe ('Message', () => {
    it ('should be a function', () => {
        expect(typeof Message).toBe('function')
    })
})

describe ('Message constructor', () => {
    let message
    const oGetMessageTypes = Message.prototype.getMessageTypes
    const oGetPlaceHolders = Message.prototype.getPlaceHolders
    const oValidateMessage = Message.prototype.validateMessage
    const oValidateTemplate = Message.prototype.validateTemplate
    const oGetFinalText = Message.prototype.getFinalText
    const MockMessageTypes = {
        'type': {
            'action': 'text'
        }
    }
    beforeEach(() => {
        Message.prototype.getMessageTypes = () => MockMessageTypes
        Message.prototype.getPlaceHolders = () => {}
        Message.prototype.validateMessage = () => {}
        Message.prototype.validateTemplate = () => {}
        Message.prototype.getFinalText = () => 'text'
        message = new Message('type', 'action')
    })
    afterEach(() => {
        Message.prototype.getMessageTypes = oGetMessageTypes
        Message.prototype.getPlaceHolders = oGetPlaceHolders
        Message.prototype.validateMessage = oValidateMessage
        Message.prototype.validateTemplate = oValidateTemplate
        Message.prototype.getFinalText = oGetFinalText
    })
    it ('should return a type property', () => {
        expect(message.type).toBe('type')
    })
    it ('should return a action property', () => {
        expect(message.action).toBe('action')
    })
    it ('should return a action property', () => {
        expect(message.text).toBe('text')
    })
    it ('should serialize with only type, action, and text properties', () => {
        expect(JSON.stringify(message))
        .toBe('{"type":"type","action":"action","text":"text"}')
    })
})

describe ('Message getMessageTypes', () => {
    it ('should return a transport message dictionary', () => {
        expect(Message.prototype.getMessageTypes())
        .toBe(Config.transport.message)
    })
})

describe ('Message getPlaceHolders', () => {
    it ('should return an empty array', () => {
        expect(Message.prototype.getPlaceHolders('')).toEqual([])
        expect(Message.prototype.getPlaceHolders('Hello World!')).toEqual([])
    })
    it ('should return an array of place holders', () => {
        expect(Message.prototype.getPlaceHolders('Hello {{WORLD}}, {{MAN}}!'))
        .toEqual(['WORLD', 'MAN'])
    })
})

describe ('Message getFinalText', () => {
    it ('should return the trimmed message', () => {
        const message = `\n\nHello World!\r\n`
        expect(Message.prototype.getFinalText(message)).toBe('Hello World!')
    })
    it ('should return the message with placeholder substitutions', () => {
        const message = 'Hello {{WORLD}}, {{MAN}}!'
        const template = { 'WORLD': 'there', 'MAN': 'brother' }
        expect(Message.prototype.getFinalText(message, template))
        .toBe('Hello there, brother!')
    })
})

describe ('Message validateMessage', () => {
    const oThrowError = Message.prototype.throwError
    afterEach(() => {
        Message.prototype.throwError = oThrowError
    })
    it ('should throw invalid type error', () => {
        Message.prototype.throwError = (action, template) => {
            expect(action).toBe('INVALID_MESSAGE_TYPE')
            expect(template).toEqual({
                'TYPE': 'type',
                'VALID_TYPES': 'type1, type2, type3'
            })
        }
        const mockMessageTypes = { 'type1': '', 'type2': '', 'type3': '' }
        Message.prototype.validateMessage('type', 'action', mockMessageTypes)
    })
    it ('should throw invalid message error', () => {
        Message.prototype.throwError = (action, template) => {
            expect(action).toBe('INVALID_MESSAGE_ACTION')
            expect(template).toEqual({ 'ACTION': 'ACTION' })
        }
        const mockTypes = { type: {} }
        Message.prototype.validateMessage('type', 'ACTION', mockTypes)
    })
    it ('should remain silent', () => {
        Message.prototype.throwError = () => {}
        spyOn(Message.prototype, 'throwError')
        const mockTypes = { type: { 'ACTION': 'text' } }
        Message.prototype.validateMessage('type', 'ACTION', mockTypes)
        expect(Message.prototype.throwError).not.toHaveBeenCalled()
    })
})

describe ('Message validateTemplate', () => {
    const oThrowError = Message.prototype.throwError
    afterEach(() => {
        Message.prototype.throwError = oThrowError
    })
    it ('should throw invalid template error', () => {
        const placeHolders = ['WORLD', 'MAN']
        const template = { 'WORLD': 'there' }
        Message.prototype.throwError = (action, template) => {
            expect(action).toBe('INVALID_MESSAGE_TEMPLATE')
            expect(template).toEqual({
                'MISMATCHED_PLACE_HOLDERS': 'MAN',
                'PLACE_HOLDERS': placeHolders.join(', ')
            })
        }
        Message.prototype.validateTemplate(placeHolders, template)
    })
    it ('should remain silent', () => {
        Message.prototype.throwError = () => {}
        spyOn(Message.prototype, 'throwError')
        const placeHolders = ['WORLD', 'MAN']
        const template = { 'WORLD': 'there', 'MAN': 'brother' }
        Message.prototype.validateTemplate([])
        Message.prototype.validateTemplate(placeHolders, template)
        expect(Message.prototype.throwError).not.toHaveBeenCalled()
    })
})

describe ('Message throwError', () => {
    const oThrowError = Message.prototype.throwError
    it ('should throw type error', () => {
        const template = {
            'TYPE': 'master-type',
            'VALID_TYPES': 'type1, type2, type3'
        }
        const errorMessage = Config.transport.message.error.INVALID_MESSAGE_TYPE
        .replace('{{TYPE}}', template['TYPE'])
        .replace('{{VALID_TYPES}}', template['VALID_TYPES'])
        .trim()

        expect(() => oThrowError('INVALID_MESSAGE_TYPE', template))
        .toThrowError(errorMessage)
    })
})

