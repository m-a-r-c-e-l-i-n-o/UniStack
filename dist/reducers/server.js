'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actionTypes = require('../constants/actionTypes.js');

const initialState = {
    restart: false,
    worthRestartingNow: true
};

const server = function () {
    let server = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    let _ref = arguments[1];
    let type = _ref.type;
    let payload = _ref.payload;

    switch (type) {
        case _actionTypes.SET_BUNDLER_NODE_ONLY_FILE_MODIFIED:
            return _extends({}, server, {
                worthRestartingNow: true
            });
        case _actionTypes.CLEAR_BUNDLER_PENDING_REQUEST:
            return _extends({}, server, {
                restart: false
            });
        case _actionTypes.CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS:
        case _actionTypes.CLEAR_BUNDLER_UPDATE_PREPARATIONS:
            return _extends({}, server, {
                restart: true
            });
        case _actionTypes.SET_SERVER_RESTART_PREPARATION:
            return _extends({}, server, {
                worthRestartingNow: false
            });
        case _actionTypes.CLEAR_SERVER_RESTART_PREPARATION:
            return _extends({}, server, {
                restart: false,
                worthRestartingNow: false
            });
        default:
            return server;
    }
};

exports.default = server;