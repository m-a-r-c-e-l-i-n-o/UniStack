'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _gottaCatchEmAll = require('gotta-catch-em-all');

var _actionTypes = require('../constants/actionTypes.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('unistack:errorer');

const nodeProcess = process;
const log = console;

const Errorer = (_ref) => {
    let dispatch = _ref.dispatch;
    let getState = _ref.getState;

    const state = getState();
    const watchingRejections = getStateLeaf(state, 'WATCHING_REJECTIONS_FLAG');
    if (!watchingRejections) return dispatch(watchRejections());

    const fatalError = getStateLeaf(state, 'FATAL_ERROR_FLAG');
    const errorInstance = getStateLeaf(state, 'ERROR_INSTANCE');
    const prepareToExit = getStateLeaf(state, 'PREPARE_TO_EXIT_FLAG');
    if (!prepareToExit && errorInstance && fatalError) {
        return dispatch({ type: _actionTypes.TOGGLE_PREPARE_TO_EXIT_FLAG });
    }

    if (prepareToExit) exitProcess(errorInstance);
};

const getStateLeaf = (state, leaf) => {
    switch (leaf) {
        case 'ERROR_INSTANCE':
            return state.error.instance;
        case 'FATAL_ERROR_FLAG':
            return state.error.fatal;
        case 'WATCHING_REJECTIONS_FLAG':
            return state.error.watchingRejections;
        case 'PREPARE_TO_EXIT_FLAG':
            return state.env.prepareToExit;
    }
};

const watchRejections = () => {
    debug('Attempting to watch rejections...');
    (0, _gottaCatchEmAll.gottaCatchEmAll)();
    debug('Watching rejections...');
    return { type: _actionTypes.TOGGLE_WATCHING_REJECTIONS_FLAG };
};

const exitProcess = errorInstance => {
    log.error(errorInstance.stack);
    nodeProcess.exit(1);
};

exports.default = Errorer;