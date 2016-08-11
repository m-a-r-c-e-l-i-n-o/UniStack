import Config from '../../config-tmp.js'
import Message from './message.js'

class Transport {
    static create(type) {
        const transportTypes = Object.keys(Config.transport)
        switch (type) {
            case 'message':
                return Transport.getMessageObject().create
            default:
                const errorMessage = Message.create(
                    'error',
                    'INVALID_TRANSPORT_TYPE', {
                        'TYPE': type,
                        'VALID_TYPES': transportTypes
                    }
                )
                throw new Error(errorMessage.text)
        }
    }
    static getMessageObject() {
        return Message
    }
}

export default Transport
