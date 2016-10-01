'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actionTypes = require('../constants/actionTypes.js');

const initialState = {
    watch: false,
    watching: false
};

const watcher = function () {
    let watcher = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    let _ref = arguments[1];
    let type = _ref.type;
    let payload = _ref.payload;

    switch (type) {
        case _actionTypes.CLEAR_BROADCASTER_PREPARATIONS:
            return _extends({}, watcher, {
                watch: true
            });
        case _actionTypes.SET_WATCHER_PREPARATIONS:
            return _extends({}, watcher, {
                watch: false
            });
        case _actionTypes.CLEAR_WATCHER_PREPARATIONS:
            return _extends({}, watcher, {
                watching: true
            });
        default:
            return watcher;
    }
};

exports.default = watcher;