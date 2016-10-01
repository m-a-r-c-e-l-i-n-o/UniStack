'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actionTypes = require('../constants/actionTypes.js');

const initialState = {
    install: false,
    installing: false
};

const packager = function () {
    let packager = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    let _ref = arguments[1];
    let type = _ref.type;
    let payload = _ref.payload;

    switch (type) {
        case _actionTypes.TOGGLE_ENV_INITIATED_FLAG:
            return _extends({}, packager, {
                install: true
            });
        case _actionTypes.SET_PACKAGER_INSTALLATION_PREPARATION:
            return _extends({}, packager, {
                installing: true
            });
        case _actionTypes.CLEAR_PACKAGER_INSTALLATION_PREPARATION:
            return _extends({}, packager, {
                install: false,
                installing: false
            });
        default:
            return packager;
    }
};

exports.default = packager;