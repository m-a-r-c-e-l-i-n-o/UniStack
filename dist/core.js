'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.init = undefined;

var _createStore = require('./helpers/create-store.js');

var _createStore2 = _interopRequireDefault(_createStore);

var _broadcaster = require('./components/broadcaster.js');

var _broadcaster2 = _interopRequireDefault(_broadcaster);

var _initiator = require('./components/initiator.js');

var _initiator2 = _interopRequireDefault(_initiator);

var _packager = require('./components/packager.js');

var _packager2 = _interopRequireDefault(_packager);

var _errorer = require('./components/errorer.js');

var _errorer2 = _interopRequireDefault(_errorer);

var _watcher = require('./components/watcher.js');

var _watcher2 = _interopRequireDefault(_watcher);

var _bundler = require('./components/bundler.js');

var _bundler2 = _interopRequireDefault(_bundler);

var _server = require('./components/server.js');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const init = () => {
    const store = (0, _createStore2.default)();
    const components = [_errorer2.default, _initiator2.default, _packager2.default, _broadcaster2.default, _watcher2.default, _bundler2.default, _server2.default];
    components.forEach(component => store.subscribe(() => component(store)));
    store.dispatch({ type: 'INIT' });
};

exports.init = init;