'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
const isUnknownErrorValid = exports.isUnknownErrorValid = (errorString, message) => {
    const prefixIndex = message.indexOf('Actual Error');
    const prefix = message.slice(0, prefixIndex - 1).trim();
    return errorString.trim().startsWith(prefix);
};