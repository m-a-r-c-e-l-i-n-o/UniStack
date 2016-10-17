'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _serverDestroy = require('server-destroy');

var _serverDestroy2 = _interopRequireDefault(_serverDestroy);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _http = require('http');

var _paths = require('../constants/paths.js');

var _actionTypes = require('../constants/actionTypes.js');

var _creators = require('../actions/creators.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('unistack:broadcaster');

const server = (0, _http.createServer)();
const io = (0, _socket2.default)(server);
const sockets = new Set([]);

const Broadcaster = (_ref) => {
    let dispatch = _ref.dispatch;
    let getState = _ref.getState;

    const state = getState();
    const broadcast = getStateLeaf(state, 'BROADCAST');
    const broadcasting = getStateLeaf(state, 'BROADCASTING');
    // debug('Checking if server needs to be initialized...')
    if (broadcast && !broadcasting) {
        debug('!!!!--Preparing to initialize socket server...');
        dispatch({ type: _actionTypes.SET_BROADCASTER_PREPARATIONS });
        io.on('connection', socket => {
            sockets.add(socket);
            socket.on('disconnect', () => {
                sockets.delete(socket);
            });
            socket.on('identification', name => {
                debug('Connected client: %s', name);
            });
        });
        return new Promise((resolve, reject) => {
            server.listen(5776, error => {
                if (error) reject(error);
                resolve({ server, io });
            });
            (0, _serverDestroy2.default)(server);
        }).then(() => {
            debug('@@@@--Successfully initialized server at port 5776!');
            return dispatch({ type: _actionTypes.CLEAR_BROADCASTER_PREPARATIONS });
        }).catch(error => {
            debug('@@@@--Failed to initialize server: %s', error.stack);
        });
    }

    const message = getStateLeaf(state, 'MESSAGE');
    // debug('Checking if a there is a message to share...')
    if (message) {
        debug('Yep, we sure do.');
        console.log(message);
        sockets.forEach(socket => {
            debug('Emitting to sockets');
            socket.emit('message', message);
        });
        return dispatch({ type: _actionTypes.CLEAR_BROADCASTER_MESSAGE });
    }

    // debug('Checking if a browser reload is needed...')
    const reload = getStateLeaf(state, 'RELOAD');
    if (reload) {
        debug('Yep, we sure do.');
        console.log('Reloading browser!');
        sockets.forEach(socket => {
            debug('Emitting to sockets');
            socket.emit('reload');
        });
        return dispatch({ type: _actionTypes.CLEAR_BROADCASTER_RELOAD });
    }

    // debug('Checking if there was a file change event...')
    const fileChange = getStateLeaf(state, 'FILE_CHANGE');
    if (fileChange) {
        debug('Yep, there was file change: %s %s', fileChange.name, fileChange.type);
        const absolutePath = fileChange.name;
        const relativePath = _path2.default.relative(_paths.ENV_PATH, absolutePath);
        console.log(`File (${ fileChange.type }): ${ relativePath }`);
        sockets.forEach(socket => {
            debug('Emitting to sockets %s - %s', relativePath, absolutePath);
            socket.emit('change', { path: relativePath, absolutePath });
        });
        return dispatch({ type: _actionTypes.CLEAR_BROADCASTER_FILE_CHANGE });
    }
    // debug('Nothing to do.')
};

const getStateLeaf = (state, leaf) => {
    switch (leaf) {
        case 'BROADCAST':
            return state.broadcaster.broadcast;
        case 'BROADCASTING':
            return state.broadcaster.broadcasting;
        case 'MESSAGE':
            return state.broadcaster.message;
        case 'RELOAD':
            return state.broadcaster.reload;
        case 'FILE_CHANGE':
            return state.broadcaster.fileChange;
    }
};

exports.default = Broadcaster;