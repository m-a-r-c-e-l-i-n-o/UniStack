export const isUnknownErrorValid = (errorString, message) => {
    const prefixIndex = message.indexOf('Actual Error')
    const prefix = message.slice(0, prefixIndex - 1).trim()
    return errorString.trim().startsWith(prefix)
}
