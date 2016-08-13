import Config from '../../config.js'
import XRegExp from 'xregexp'

class Message {
    constructor() {
        this.type = null
        this.action = null
        this.text = null
    }
    static create(type, action, template) {
        const message = Message.createObjectInstance()
        const messageTypes = message.getMessageTypes()
        const rawText = message.getRawText(type, action, messageTypes)
        const placeHolders = message.getPlaceHolders(rawText)
        const finalText = message.getFinalText(rawText, placeHolders, template)

        message.type = type
        message.action = action
        message.text = finalText

        return message
    }
    static createObjectInstance() {
        return new Message()
    }
    getMessageTypes () {
        return Config.transport.message
    }
    getPlaceHolders(rawText) {
        const placeHolderPattern = /\{\{[A-Z_1-9]+\}\}/g
        const placeHolders = rawText.match(placeHolderPattern) || []
        const bracketPattern = /\{\{|\}\}/g

        return placeHolders.map(
            placeHolder => placeHolder.replace(bracketPattern, '')
        )
    }
    getFinalText(rawText, placeHolders = [], template = {}) {
        const mismatches = placeHolders.filter(
            placeHolder => !template[placeHolder]
        )

        if (mismatches.length > 0) {
            this.throwError('INVALID_MESSAGE_TEMPLATE', {
                'MISMATCHED_PLACE_HOLDERS': mismatches.join(', '),
                'PLACE_HOLDERS': placeHolders.join(', ')
            })
        }

        let finalText = rawText
        Object.keys(template).forEach(placeHolder => {
            const placeHolderRegex = XRegExp(`{{${placeHolder}}}`, 'g')
            finalText = finalText.replace(placeHolderRegex, template[placeHolder])
        })
        return finalText.trim()
    }
    getRawText(type, action, messageTypes) {
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

        return messageTypes[type][action]
    }
    throwError(action, template) {
        throw new Error(Message.create('error', action, template).text)
    }
}

export default Message
