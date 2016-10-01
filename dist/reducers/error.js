'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actionTypes = require('../constants/actionTypes.js');

const initialState = {
    fatal: null,
    instance: null,
    watchingRejections: null
};

const error = function () {
    let error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    let _ref = arguments[1];
    let type = _ref.type;
    let payload = _ref.payload;

    switch (type) {
        case _actionTypes.HANDLE_ERROR:
            return _extends({}, error, {
                instance: payload.error,
                fatal: payload.fatal
            });
        case _actionTypes.TOGGLE_WATCHING_REJECTIONS_FLAG:
            return _extends({}, error, {
                watchingRejections: !error.watchingRejections
            });
        default:
            return error;
    }
};

exports.default = error;