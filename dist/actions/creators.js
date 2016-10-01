'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setWatcherModifiedFile = exports.setBundlerInvalidFile = exports.setEnvFilesPresentFlag = exports.setEnvPopulatedFlag = exports.handleError = undefined;

var _templatedText = require('../helpers/templated-text.js');

var _templatedText2 = _interopRequireDefault(_templatedText);

var _errors = require('../constants/language/errors.js');

var _actionTypes = require('../constants/actionTypes.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const handleError = exports.handleError = function (error) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    let message = _ref.message;
    let fatal = _ref.fatal;

    fatal = fatal || false;
    if (message) {
        const customErrorMessage = (0, _templatedText2.default)(message, {
            'ERROR': `${ error.message }\n${ error.stack }`
        });
        error = new Error(customErrorMessage);
        Error.captureStackTrace(error, handleError);
    }
    return { type: _actionTypes.HANDLE_ERROR, payload: { error, fatal } };
};

const setEnvPopulatedFlag = exports.setEnvPopulatedFlag = status => {
    return { type: _actionTypes.SET_ENV_POPULATED_FLAG, payload: status };
};

const setEnvFilesPresentFlag = exports.setEnvFilesPresentFlag = status => {
    return { type: _actionTypes.SET_ENV_FILES_PRESENT_FLAG, payload: status };
};

const setBundlerInvalidFile = exports.setBundlerInvalidFile = invalid => {
    return { type: _actionTypes.SET_BUNDLER_INVALID_FILE, payload: invalid };
};

const setWatcherModifiedFile = exports.setWatcherModifiedFile = file => {
    return { type: _actionTypes.SET_WATCHER_MODIFIED_FILE, payload: file };
};