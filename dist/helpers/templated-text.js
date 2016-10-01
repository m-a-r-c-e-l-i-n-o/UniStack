'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _xregexp = require('xregexp');

var _xregexp2 = _interopRequireDefault(_xregexp);

var _templatedText = require('../constants/language/helpers/templated-text.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const templatedText = function (rawText) {
    let template = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!(0, _lodash.isString)(rawText)) {
        const invalidRawText = templatedText(_templatedText.INVALID_RAW_TEXT, {
            'TYPE_RECEIVED': Object.prototype.toString.call(rawText)
        });
        throw new Error(invalidRawText);
    }
    const placeHolders = getPlaceHolders(rawText);
    return getFinalText(rawText, placeHolders, template);
};

const getPlaceHolders = rawText => {
    const placeHolderPattern = /\{\{[A-Z_1-9]+\}\}/g;
    const placeHolders = rawText.match(placeHolderPattern) || [];
    const bracketPattern = /\{\{|\}\}/g;
    return placeHolders.map(placeHolder => placeHolder.replace(bracketPattern, ''));
};

const getFinalText = (rawText, placeHolders, template) => {
    const mismatches = placeHolders.filter(placeHolder => !template[placeHolder]);
    if (mismatches.length > 0) {
        const templatedMismatchError = templatedText(_templatedText.MISMATCH_ERROR, {
            'MISMATCHED_PLACE_HOLDERS': mismatches.join(', '),
            'PLACE_HOLDERS': placeHolders.join(', ')
        });
        throw new Error(templatedMismatchError);
    }
    let finalText = rawText;
    Object.keys(template).forEach(placeHolder => {
        const placeHolderRegex = (0, _xregexp2.default)(`{{${ placeHolder }}}`, 'g');
        finalText = finalText.replace(placeHolderRegex, template[placeHolder]);
    });
    return finalText.trim();
};

exports.default = templatedText;