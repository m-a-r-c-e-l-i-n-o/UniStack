import Config from '../../config-tmp.js'
import Message from './message.js'

export default function Transport (type) {
    const transportTypes = Object.keys(Config.transport)
    switch (type) {
        case 'message':
            return Message
        default:
            const errorMessage = new Message('error', 'INVALID_TRANSPORT_TYPE', {
                'TYPE': type,
                'VALID_TYPES': transportTypes
            })
            throw new Error(errorMessage.text)
    }
}
