import { isPlainObject, isString } from 'lodash'
import XRegExp from 'xregexp'
import {
    MISMATCH_ERROR, INVALID_RAW_TEXT, INVALID_TEMPLATE
} from '../constants/language/helpers/templated-text.js'

const templatedText = (rawText, template = {}) => {
    if (!isString(rawText)) {
        const invalidRawText = templatedText(
            INVALID_RAW_TEXT, {
                'TYPE_RECEIVED': Object.prototype.toString.call(rawText)
            }
        )
        throw new Error(invalidRawText)
    }
    const placeHolders = getPlaceHolders(rawText)
    return getFinalText(rawText, placeHolders, template)
}

const getPlaceHolders = (rawText) => {
    const placeHolderPattern = /\{\{[A-Z_1-9]+\}\}/g
    const placeHolders = rawText.match(placeHolderPattern) || []
    const bracketPattern = /\{\{|\}\}/g
    return placeHolders.map(
        placeHolder => placeHolder.replace(bracketPattern, '')
    )
}

const getFinalText = (rawText, placeHolders, template) => {
    const mismatches = placeHolders.filter(
        placeHolder => !template[placeHolder]
    )
    if (mismatches.length > 0) {
        const templatedMismatchError = templatedText(
            MISMATCH_ERROR, {
                'MISMATCHED_PLACE_HOLDERS': mismatches.join(', '),
                'PLACE_HOLDERS': placeHolders.join(', ')
            }
        )
        throw new Error(templatedMismatchError)
    }
    let finalText = rawText
    Object.keys(template).forEach(placeHolder => {
        const placeHolderRegex = XRegExp(`{{${placeHolder}}}`, 'g')
        finalText = finalText.replace(placeHolderRegex, template[placeHolder])
    })
    return finalText.trim()
}

export default templatedText
