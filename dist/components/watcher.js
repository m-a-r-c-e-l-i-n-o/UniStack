'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _gaze = require('gaze');

var _gaze2 = _interopRequireDefault(_gaze);

var _formattedFile = require('../helpers/formatted-file.js');

var _paths = require('../constants/paths.js');

var _actionTypes = require('../constants/actionTypes.js');

var _creators = require('../actions/creators.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('unistack:watcher');

const Watcher = (_ref) => {
    let dispatch = _ref.dispatch;
    let getState = _ref.getState;

    const state = getState();
    const watch = getStateLeaf(state, 'WATCH');
    const watching = getStateLeaf(state, 'WATCHING');
    debug('Checking if it is worth watching the files...');
    if (watch && !watching) {
        const pattern = _path2.default.join(_paths.ENV_PATH, '{src,dist/css}', '**/*');
        debug('!!!!--Preparing to watch files: %s', pattern);
        dispatch({ type: _actionTypes.SET_WATCHER_PREPARATIONS });
        const gaze = new _gaze2.default(pattern);
        gaze.on('all', (event, filepath) => {
            const formattedFile = (0, _formattedFile.modifiedFile)(filepath, event);
            debug('Emitting file change: %s - %s', event, filepath);
            return dispatch((0, _creators.setWatcherModifiedFile)(formattedFile));
        });
        gaze.on('ready', () => {
            debug('@@@@--Successfully watching files...');
            return dispatch({ type: _actionTypes.CLEAR_WATCHER_PREPARATIONS });
        });
        gaze.on('error', error => {
            debug('@@@@--Failed to watch files, %s', error.stack);
            return dispatch((0, _creators.handleError)(error));
        });
    }
    debug('Nothing to do.');
};

const getStateLeaf = (state, leaf) => {
    switch (leaf) {
        case 'WATCH':
            return state.watcher.watch;
        case 'WATCHING':
            return state.watcher.watching;
    }
};

exports.default = Watcher;