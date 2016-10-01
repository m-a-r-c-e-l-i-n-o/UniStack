'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actionTypes = require('../constants/actionTypes.js');

const initialState = {
    initiated: false,
    filesPresent: null,
    populated: null,
    prepareToExit: null
};

const env = function () {
    let env = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    let _ref = arguments[1];
    let type = _ref.type;
    let payload = _ref.payload;

    switch (type) {
        case _actionTypes.TOGGLE_ENV_INITIATED_FLAG:
            return _extends({}, env, {
                initiated: !env.initiated
            });
        case _actionTypes.SET_ENV_FILES_PRESENT_FLAG:
            return _extends({}, env, {
                filesPresent: payload
            });
        case _actionTypes.SET_ENV_POPULATED_FLAG:
            return _extends({}, env, {
                populated: payload
            });
        case _actionTypes.TOGGLE_PREPARE_TO_EXIT_FLAG:
            return _extends({}, env, {
                prepareToExit: true
            });
        default:
            return env;
    }
};

exports.default = env;