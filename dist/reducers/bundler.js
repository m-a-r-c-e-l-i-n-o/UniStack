'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actionTypes = require('../constants/actionTypes.js');

const initialState = {
    initial: true,
    update: false,
    updating: false,
    invalidFile: null,
    filesInvalidated: false,
    modifiedFile: null,
    pendingRequest: true
};

const bundler = function () {
    let bundler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    let _ref = arguments[1];
    let type = _ref.type;
    let payload = _ref.payload;

    switch (type) {
        case _actionTypes.CLEAR_BROADCASTER_PREPARATIONS:
            return _extends({}, bundler, {
                update: true
            });
        case _actionTypes.SET_BUNDLER_INVALID_FILE:
            return _extends({}, bundler, {
                invalidFile: payload,
                updating: false
            });
        case _actionTypes.CLEAR_BUNDLER_INVALID_FILE:
            return _extends({}, bundler, {
                invalidFile: null,
                modifiedFile: null,
                pendingRequest: true
            });
        case _actionTypes.SET_BUNDLER_NODE_ONLY_FILE_MODIFIED:
        case _actionTypes.CLEAR_NEWLY_MODIFIED_FILE_FLAG:
            return _extends({}, bundler, {
                modifiedFile: null,
                pendingRequest: true
            });
        case _actionTypes.CLEAR_BUNDLER_PENDING_REQUEST:
            return _extends({}, bundler, {
                filesInvalidated: true,
                pendingRequest: false
            });
        case _actionTypes.SET_WATCHER_MODIFIED_FILE:
            return _extends({}, bundler, {
                filesInvalidated: false,
                modifiedFile: _extends({}, payload)
            });
        case _actionTypes.SET_BUNDLER_UPDATE_PREPARATIONS:
            return _extends({}, bundler, {
                updating: true
            });
        case _actionTypes.CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS:
        case _actionTypes.CLEAR_BUNDLER_UPDATE_PREPARATIONS:
            return _extends({}, bundler, {
                initial: false,
                updating: false,
                filesInvalidated: false
            });
        default:
            return bundler;
    }
};

exports.default = bundler;