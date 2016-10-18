'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

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
    // debug('Checking if it is worth watching the files...')
    if (watch && !watching) {
        const files = [_path2.default.join('src', '**/*'), _path2.default.join('dist', 'css'), _path2.default.join('bootstrap', 'src')];
        debug('!!!!--Preparing to watch files!!!!!!!!!!1: %s', files);
        dispatch({ type: _actionTypes.SET_WATCHER_PREPARATIONS });
        const watcherSettings = { cwd: _paths.ENV_PATH, ignoreInitial: true };
        const watcher = _chokidar2.default.watch(files, watcherSettings);

        watcher.on('add', filepath => dispatch(handleFileMofidication('add', filepath)));
        watcher.on('change', filepath => dispatch(handleFileMofidication('change', filepath)));
        watcher.on('unlink', filepath => dispatch(handleFileMofidication('unlink', filepath)));
        watcher.on('ready', () => {
            debug('@@@@--Successfully watching files...');
            return dispatch({ type: _actionTypes.CLEAR_WATCHER_PREPARATIONS });
        });
        watcher.on('error', error => {
            debug('@@@@--Failed to watch files, %s', error.stack);
            return dispatch((0, _creators.handleError)(error));
        });
    }
    // debug('Nothing to do.')
};

const getStateLeaf = (state, leaf) => {
    switch (leaf) {
        case 'WATCH':
            return state.watcher.watch;
        case 'WATCHING':
            return state.watcher.watching;
    }
};

const handleFileMofidication = (event, filepath) => {
    const absoluteFilepath = _path2.default.join(_paths.ENV_PATH, filepath);
    debug('Emitting file change: %s - %s', event, absoluteFilepath);
    const formattedFile = (0, _formattedFile.modifiedFile)(absoluteFilepath, event);
    return (0, _creators.setWatcherModifiedFile)(formattedFile);
};

exports.default = Watcher;