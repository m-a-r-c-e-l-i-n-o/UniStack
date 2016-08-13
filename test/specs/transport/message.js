import Config from '../../../config.js'
import Message from '../../../src/transport/message.js'

describe ('Message', () => {
    it ('should be a function', () => {
        expect(typeof Message).toBe('function')
    })
})

describe ('Message constructor', () => {
    it ('should return a type property', () => {
        const message = new Message()
        expect(message.type).toBe(null)
    })
    it ('should return a action property', () => {
        const message = new Message()
        expect(message.action).toBe(null)
    })
    it ('should return a action property', () => {
        const message = new Message()
        expect(message.text).toBe(null)
    })
    it ('should serialize with only type, action, and text properties', () => {
        const message = new Message()
        expect(JSON.stringify(message))
        .toBe('{"type":null,"action":null,"text":null}')
    })
})

describe ('Message createObjectInstance', () => {
    it ('should call the "createObjectInstance" method', () => {
        expect(Message.createObjectInstance()).toEqual(new Message())
    })
})

describe ('Message create', () => {
    const mockMessageTypes = {
        'type': {
            'action': 'text'
        }
    }
    const originalCreateObjectInstance = Message.createObjectInstance
    const mockMessage = {
        type: null,
        action: null,
        text: null
    }
    beforeEach(() => {
        Message.createObjectInstance = () => mockMessage
        mockMessage.getMessageTypes = () => mockMessageTypes
        mockMessage.getRawText = () => 'text'
        mockMessage.getPlaceHolders = () => []
        mockMessage.getFinalText = () => 'text'
    })
    afterEach(() => {
        Message.createObjectInstance = originalCreateObjectInstance
    })
    it ('should call the "createObjectInstance" method', () => {
        spyOn(Message, 'createObjectInstance').and.callThrough()
        Message.create()
        expect(Message.createObjectInstance).toHaveBeenCalledTimes(1)
    })
    it ('should call the "getMessageTypes" method', () => {
        spyOn(mockMessage, 'getMessageTypes').and.callThrough()
        Message.create()
        expect(mockMessage.getMessageTypes).toHaveBeenCalledTimes(1)
    })
    it ('should call the "getRawText" method', () => {
        spyOn(mockMessage, 'getRawText')
        Message.create('type', 'action')
        expect(mockMessage.getRawText).toHaveBeenCalledTimes(1)
        expect(mockMessage.getRawText)
        .toHaveBeenCalledWith('type', 'action', mockMessageTypes)
    })
    it ('should call the "getPlaceHolders" method', () => {
        spyOn(mockMessage, 'getPlaceHolders')
        Message.create('type', 'action')
        expect(mockMessage.getPlaceHolders).toHaveBeenCalledTimes(1)
        expect(mockMessage.getPlaceHolders).toHaveBeenCalledWith('text')
    })
    it ('should call the "getFinalText" method', () => {
        spyOn(mockMessage, 'getFinalText')
        Message.create('type', 'action', {})
        expect(mockMessage.getFinalText).toHaveBeenCalledTimes(1)
        expect(mockMessage.getFinalText)
        .toHaveBeenCalledWith('text', [], {})
    })
    it ('should return a type property', () => {
        const message = Message.create('type', 'action')
        expect(message).toEqual(jasmine.objectContaining({
            type: 'type',
            action: 'action',
            text: 'text'
        }))
    })
})

describe ('Message getMessageTypes', () => {
    it ('should return a transport message dictionary', () => {
        const message = new Message()
        expect(message.getMessageTypes())
        .toBe(Config.transport.message)
    })
})

describe ('Message getPlaceHolders', () => {
    it ('should return an empty array', () => {
        const message = new Message()
        expect(message.getPlaceHolders('')).toEqual([])
        expect(message.getPlaceHolders('Hello World!')).toEqual([])
    })
    it ('should return an array of place holders', () => {
        const message = new Message()
        expect(message.getPlaceHolders('Hello {{WORLD}}, {{MAN}}!'))
        .toEqual(['WORLD', 'MAN'])
    })
})

describe ('Message getFinalText', () => {
    it ('should throw invalid template error', (done) => {
        const message = new Message()
        const placeHolders = ['WORLD', 'MAN']
        const template = { 'WORLD': 'there' }
        message.throwError = (action, template) => {
            expect(action).toBe('INVALID_MESSAGE_TEMPLATE')
            expect(template).toEqual({
                'MISMATCHED_PLACE_HOLDERS': 'MAN',
                'PLACE_HOLDERS': placeHolders.join(', ')
            })
            done()
        }
        message.getFinalText('', placeHolders, template)
    })
    it ('should return the trimmed message', () => {
        const message = new Message()
        const rawText = `\n\nHello World!\r\n`
        expect(message.getFinalText(rawText)).toBe('Hello World!')
    })
    it ('should return the message with placeholder substitutions', () => {
        const message = new Message()
        const rawText = 'Hello {{WORLD}}, {{MAN}} of my {{MAN}}!'
        const placeholders = ['WORLD', 'MAN']
        const template = { 'WORLD': 'there', 'MAN': 'brother' }
        expect(message.getFinalText(rawText, placeholders, template))
        .toBe('Hello there, brother of my brother!')
    })
})

describe ('Message getRawText', () => {
    it ('should throw invalid type error', (done) => {
        const message = new Message()
        message.throwError = (action, template) => {
            expect(action).toBe('INVALID_MESSAGE_TYPE')
            expect(template).toEqual({
                'TYPE': 'type',
                'VALID_TYPES': 'type1, type2, type3'
            })
            done()
        }
        const mockMessageTypes = { 'type1': '', 'type2': '', 'type3': '' }
        message.getRawText('type', 'action', mockMessageTypes)
    })
    it ('should throw invalid message error', (done) => {
        const message = new Message()
        message.throwError = (action, template) => {
            expect(action).toBe('INVALID_MESSAGE_ACTION')
            expect(template).toEqual({ 'ACTION': 'ACTION' })
            done()
        }
        const mockTypes = { type: {} }
        message.getRawText('type', 'ACTION', mockTypes)
    })
    it ('should return the message\'s raw text', () => {
        const message = new Message()
        const mockTypes = { type: { 'ACTION': 'text' } }

        message.throwError = () => {}
        spyOn(message, 'throwError')
        message.getRawText('type', 'ACTION', mockTypes)
        expect(message.throwError).not.toHaveBeenCalled()
    })
})

describe ('Message throwError', () => {
    it ('should throw type error', () => {
        const message = new Message()
        const template = {
            'TYPE': 'master-type',
            'VALID_TYPES': 'type1, type2, type3'
        }
        const errorMessage = Config.transport.message.error.INVALID_MESSAGE_TYPE
        .replace('{{TYPE}}', template['TYPE'])
        .replace('{{VALID_TYPES}}', template['VALID_TYPES'])
        .trim()

        expect(() => message.throwError('INVALID_MESSAGE_TYPE', template))
        .toThrowError(errorMessage)
    })
})
