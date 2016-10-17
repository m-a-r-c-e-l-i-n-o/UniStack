'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _serverDestroy = require('server-destroy');

var _serverDestroy2 = _interopRequireDefault(_serverDestroy);

var _files = require('../constants/files.js');

var _errors = require('../constants/language/errors.js');

var _actionTypes = require('../constants/actionTypes.js');

var _creators = require('../actions/creators.js');

var _createLocalState = require('../helpers/create-local-state.js');

var _createLocalState2 = _interopRequireDefault(_createLocalState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('unistack:server');

const serverKey = 'server';
const localState = (0, _createLocalState2.default)({
    server: { destroy: () => Promise.resolve() }
});

const Server = (_ref) => {
    let dispatch = _ref.dispatch;
    let getState = _ref.getState;

    const state = getState();
    const serve = getStateLeaf(state, 'SERVE');
    const restart = getStateLeaf(state, 'RESTART');
    const worthRestartingNow = getStateLeaf(state, 'WORTH_RESTARTING_NOW');
    // debug('Checking if it is worth restarting the server...')
    if (restart && worthRestartingNow) {
        debug('!!!!--Preparing to restart the server.');
        dispatch({ type: _actionTypes.SET_SERVER_RESTART_PREPARATION });
        return restartServer().then(() => dispatch({ type: _actionTypes.CLEAR_SERVER_RESTART_PREPARATION })).catch(error => {
            debug('@@@@--Failed at restarting the server: %s', error.stack);
            return dispatch(makeUnknownServerError(error));
        });
    }
    // debug('Nothing to do.')
};

const getStateLeaf = (state, leaf) => {
    switch (leaf) {
        case 'SERVE':
            return state.server.serve;
        case 'RESTART':
            return state.server.restart;
        case 'WORTH_RESTARTING_NOW':
            return state.server.worthRestartingNow;
    }
};

const makeUnknownServerError = error => {
    const message = _errors.UNKNOWN_SERVER_ERROR;
    return (0, _creators.handleError)(error, { message });
};

const loadServer = () => {
    debug('!!!!--Requiring node bundle...');
    delete require.cache[_files.ENV_NODE_DEV_BUNDLE_FILE];
    const result = require(_files.ENV_NODE_DEV_BUNDLE_FILE).serve;
    debug('@@@@--Node bundle successfully required.');
    return result;
};

const restartServer = () => {
    return localState.get(serverKey).destroy().then(loadServer).then(serverInstance => {
        (0, _serverDestroy2.default)(serverInstance);
        const promisifiedDestroy = () => new Promise(resolve => serverInstance.destroy(resolve));
        localState.set(serverKey, { destroy: promisifiedDestroy });
        debug('@@@@--Server successfully restarted.');
    });
};

exports.default = Server;