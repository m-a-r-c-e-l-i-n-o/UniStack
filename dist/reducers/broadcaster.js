'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actionTypes = require('../constants/actionTypes.js');

const initialState = {
    broadcast: false,
    broadcasting: false,
    fileChange: null,
    reload: false,
    message: null
};

const broadcaster = function () {
    let broadcaster = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    let _ref = arguments[1];
    let type = _ref.type;
    let payload = _ref.payload;

    switch (type) {
        case _actionTypes.CLEAR_SERVER_RESTART_PREPARATION:
            return _extends({}, broadcaster, {
                reload: true
            });
        case _actionTypes.CLEAR_BROADCASTER_RELOAD:
            return _extends({}, broadcaster, {
                reload: false
            });
        case _actionTypes.HANDLE_ERROR:
            return _extends({}, broadcaster, {
                message: payload.error.stack
            });
        case _actionTypes.CLEAR_BROADCASTER_MESSAGE:
            return _extends({}, broadcaster, {
                message: null
            });
        case _actionTypes.SET_WATCHER_MODIFIED_FILE:
            return _extends({}, broadcaster, {
                fileChange: _extends({}, payload)
            });
        case _actionTypes.CLEAR_BROADCASTER_FILE_CHANGE:
            return _extends({}, broadcaster, {
                fileChange: null
            });
        case _actionTypes.CLEAR_PACKAGER_INSTALLATION_PREPARATION:
            return _extends({}, broadcaster, {
                broadcast: true
            });
        case _actionTypes.SET_BROADCASTER_PREPARATIONS:
            return _extends({}, broadcaster, {
                broadcast: false
            });
        case _actionTypes.CLEAR_BROADCASTER_PREPARATIONS:
            return _extends({}, broadcaster, {
                broadcasting: true
            });
        default:
            return broadcaster;
    }
};

exports.default = broadcaster;