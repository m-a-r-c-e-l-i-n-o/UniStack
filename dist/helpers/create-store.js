'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _index = require('../reducers/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const storeCreator = initialState => {
    return (0, _redux.applyMiddleware)(_reduxThunk2.default)(_redux.createStore)(_index2.default, initialState);
};

exports.default = storeCreator;