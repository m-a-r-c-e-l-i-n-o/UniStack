import Config from '../../../config-tmp.js'
import Transport from '../../../src/transport/index.js'
import Message from '../../../src/transport/message.js'

describe ('Transport', () => {
    it ('should be a function', () => {
        expect(typeof Transport).toBe('function')
    })
})

describe ('Transport create', () => {
    it ('should return create message transport', () => {
        const mockCreateMessage = () => { console.log('hellow rold')}
        const mockMessage = { create: mockCreateMessage }
        const originalGetMessageObject = Transport.getMessageObject
        Transport.getMessageObject = () => mockMessage
        expect(Transport.create('message')).toBe(mockCreateMessage)
        Transport.getMessageObject = originalGetMessageObject
    })
    it ('should throw type error', () => {
        const template = {
            'TYPE': 'master-type',
            'VALID_TYPES': 'message'
        }
        const errorMessage = Config.transport.message.error.INVALID_TRANSPORT_TYPE
        .replace('{{TYPE}}', template['TYPE'])
        .replace('{{VALID_TYPES}}', template['VALID_TYPES'])
        .trim()

        expect(() => Transport.create('master-type')).toThrowError(errorMessage)
    })
})

describe ('Transport getMessageObject', () => {
    it ('should be a function', () => {
        expect(Transport.getMessageObject()).toBe(Message)
    })
})
