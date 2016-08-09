import Config from '../../../config-tmp.js'
import Transport from '../../../src/transport/index.js'
import Message from '../../../src/transport/message.js'

describe ('Transport', () => {
    it ('should be a function', () => {
        expect(typeof Transport).toBe('function')
    })
    it ('should return message transport', () => {
        expect(Transport('message')).toBe(Message)
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

        expect(() => Transport('master-type')).toThrowError(errorMessage)
    })
})
