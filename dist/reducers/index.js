'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _broadcaster = require('./broadcaster.js');

var _broadcaster2 = _interopRequireDefault(_broadcaster);

var _packager = require('./packager.js');

var _packager2 = _interopRequireDefault(_packager);

var _watcher = require('./watcher.js');

var _watcher2 = _interopRequireDefault(_watcher);

var _bundler = require('./bundler.js');

var _bundler2 = _interopRequireDefault(_bundler);

var _server = require('./server.js');

var _server2 = _interopRequireDefault(_server);

var _error = require('./error.js');

var _error2 = _interopRequireDefault(_error);

var _env = require('./env.js');

var _env2 = _interopRequireDefault(_env);

var _redux = require('redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const reducers = (0, _redux.combineReducers)({
    broadcaster: _broadcaster2.default,
    packager: _packager2.default,
    watcher: _watcher2.default,
    bundler: _bundler2.default,
    server: _server2.default,
    error: _error2.default,
    env: _env2.default
});

exports.default = reducers;