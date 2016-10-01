'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _templatedText = require('./templated-text.js');

var _templatedText2 = _interopRequireDefault(_templatedText);

var _createLocalState = require('../constants/language/helpers/create-local-state.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createLocalState = initialState => {
    const state = Object.assign({}, initialState);
    return {
        set: (key, value) => setValue(key, value, state),
        get: function (key) {
            if (arguments.length === 0) return Object.assign({}, state);
            return getValue(key, state);
        }
    };
};

const setValue = (key, value, state) => {
    if (!(key in state)) throw makeUnregisteredKeyError(key);
    const oldValue = state[key];
    state[key] = value;
    return oldValue;
};

const getValue = (key, state) => {
    if (!(key in state)) throw makeUnregisteredKeyError(key);
    return state[key];
};

const makeUnregisteredKeyError = key => {
    const template = { 'KEY': key };
    const errorMessage = (0, _templatedText2.default)(_createLocalState.KEY_NOT_REGISTERED_ERROR, template);
    return new Error(errorMessage);
};

exports.default = createLocalState;