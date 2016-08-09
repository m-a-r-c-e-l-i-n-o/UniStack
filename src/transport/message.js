import Config from '../../config-tmp.js'

class Message {
    constructor(type, action, template) {
        const messageTypes = this.getMessageTypes()
        this.validateMessage(type, action, messageTypes)

        const message = messageTypes[type][action]
        const placeHolders = this.getPlaceHolders(message)
        this.validateTemplate(placeHolders, template)

        this.type = type
        this.action = action
        this.text = this.getFinalText(message, template)
    }
    getMessageTypes () {
        return Config.transport.message
    }
    getPlaceHolders(message) {
        const placeHolderPattern = /\{\{[A-Z_1-9]+\}\}/g
        const placeHolders = message.match(placeHolderPattern) || []
        const bracketPattern = /\{\{|\}\}/g
        return placeHolders.map(
            placeHolder => placeHolder.replace(bracketPattern, '')
        )
    }
    getFinalText(message, template = {}) {
        Object.keys(template).forEach(placeHolder => {
            message = message.replace(`{{${placeHolder}}}`, template[placeHolder])
        })
        return message.trim()
    }
    validateMessage(type, action, messageTypes) {
        const validTypes = Object.keys(messageTypes)
        if (!validTypes.includes(type)) {
            return this.throwError('INVALID_MESSAGE_TYPE', {
                'TYPE': type,
                'VALID_TYPES': validTypes.join(', ')
            })
        }
        if (typeof messageTypes[type][action] !== 'string') {
            return this.throwError('INVALID_MESSAGE_ACTION', { 'ACTION': action })
        }
    }
    validateTemplate(placeHolders, template = {}) {
        const mismatches = placeHolders.filter(
            placeHolder => !template[placeHolder]
        )
        if (mismatches.length > 0) {
            this.throwError('INVALID_MESSAGE_TEMPLATE', {
                'MISMATCHED_PLACE_HOLDERS': mismatches.join(', '),
                'PLACE_HOLDERS': placeHolders.join(', ')
            })
        }
    }
    throwError(action, template) {
        throw new Error(new Message('error', action, template).text)
    }
}

export default Message
