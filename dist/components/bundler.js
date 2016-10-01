'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _templatedText = require('../helpers/templated-text.js');

var _templatedText2 = _interopRequireDefault(_templatedText);

var _createLocalState = require('../helpers/create-local-state.js');

var _createLocalState2 = _interopRequireDefault(_createLocalState);

var _files = require('../constants/files.js');

var _paths = require('../constants/paths.js');

var _errors = require('../constants/language/errors.js');

var _actionTypes = require('../constants/actionTypes.js');

var _creators = require('../actions/creators.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('unistack:bundler');

const browserBundler = 'browserBundler';
const nodeBundler = 'nodeBundler';
const localState = (0, _createLocalState2.default)({ initialized: false, browserBundler, nodeBundler });

const Bundler = (_ref) => {
    let dispatch = _ref.dispatch;
    let getState = _ref.getState;

    const state = getState();
    const update = getStateLeaf(state, 'UPDATE');
    if (!update) return;

    debug('Checking if local state needs to be initialized...');
    if (!localState.get('initialized')) {
        debug('Attempting to initialize the local state...');
        try {
            initializeBundlers();
            debug('Initialized the local state.');
            localState.set('initialized', true);
        } catch (error) {
            debug('Failed to initialize the local state.');
            return dispatch(makeUnknownBundlerInitError(error));
        }
    }

    debug('Checking if there is a newly modified file...');
    const initial = getStateLeaf(state, 'INITIAL');
    const invalidFile = getStateLeaf(state, 'INVALID_FILE');
    const modifiedFile = getStateLeaf(state, 'MODIFIED_FILE');
    if (!initial && modifiedFile) {
        debug('Yep, there is a modified file. Name: %s, Type: %s', modifiedFile.name, modifiedFile.type);
        return dispatch(handleModifiedFile(modifiedFile.name, invalidFile));
    }

    const updating = getStateLeaf(state, 'UPDATING');
    const pendingRequest = getStateLeaf(state, 'PENDING_REQUEST');
    debug('Checking if there is a bundle request pending...');
    if (!updating && pendingRequest) {
        debug('There is a pending bundler.');
        return dispatch({ type: _actionTypes.CLEAR_BUNDLER_PENDING_REQUEST });
    }

    debug('Checking if bundler is worth is updating...');
    const filesInvalidated = getStateLeaf(state, 'FILES_INVALIDATED');
    if (filesInvalidated && !updating && !invalidFile) {
        debug('!!!!--Preparing to run bundlers.');
        dispatch({ type: _actionTypes.SET_BUNDLER_UPDATE_PREPARATIONS });
        return runBundler().then(() => {
            if (initial) {
                debug('@@@@--Initial bundles successfully created.');
                return dispatch({
                    type: _actionTypes.CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS
                });
            }
            debug('@@@@--Bundlers ran successfully.');
            return dispatch({ type: _actionTypes.CLEAR_BUNDLER_UPDATE_PREPARATIONS });
        }).catch(error => {
            debug('@@@@--Running bundler failed.');
            debug('Checking if it is an invalid file error...');
            const invalidFile = getInvalidFile(error);
            if (invalidFile) {
                debug('It appears that it is.');
                dispatch((0, _creators.setBundlerInvalidFile)(invalidFile));
                return dispatch(makeInvalidFileError(error, invalidFile, initial));
            }
            debug('It appears that it is not.');
            debug('Issuing an unknown error.');
            dispatch({ type: _actionTypes.CLEAR_BUNDLER_UPDATE_PREPARATIONS });
            return dispatch(makeUnknownBundleError(error, initial));
        });
    }
    debug('Nothing to do.');
};

const getStateLeaf = (state, leaf) => {
    switch (leaf) {
        case 'INITIAL':
            return state.bundler.initial;
        case 'UPDATE':
            return state.bundler.update;
        case 'UPDATING':
            return state.bundler.updating;
        case 'PENDING_REQUEST':
            return state.bundler.pendingRequest;
        case 'MODIFIED_FILE':
            return state.bundler.modifiedFile;
        case 'FILES_INVALIDATED':
            return state.bundler.filesInvalidated;
        case 'INVALID_FILE':
            return state.bundler.invalidFile;
    }
};

const runBundler = () => {
    const buildOptions = {
        production: false,
        minify: false,
        mangle: false,
        sourceMaps: true,
        lowResSourceMaps: false
    };

    const browserInstance = localState.get(browserBundler);
    const browserBuildOptions = _lodash2.default.extend({}, buildOptions);
    const browserBundlePromise = browserInstance.bundle(_files.ENV_BROWSER_ENTRY_FILE, _files.ENV_BROWSER_BUNDLE_FILE, browserBuildOptions);

    const nodeBuildOptions = _lodash2.default.extend({}, {
        node: true,
        conditions: { 'unistack/unistats|platform': 'node' }
    }, buildOptions);

    const nodeInstance = localState.get(nodeBundler);
    const nodeBundlePromise = nodeInstance.buildStatic(_files.ENV_NODE_ENTRY_FILE, _files.ENV_NODE_DEV_BUNDLE_FILE, nodeBuildOptions);

    return Promise.all([browserBundlePromise, nodeBundlePromise]);
};

const makeUnknownBundleError = (error, initial) => {
    const message = _errors.UNKNOWN_BUNDLE_BUILD_ERROR;
    return (0, _creators.handleError)(error, { message, fatal: initial });
};

const makeInvalidFileError = (error, invalidFile, initial) => {
    const message = (0, _templatedText2.default)(_errors.BUNDLE_BUILD_ERROR, {
        'FILENAME': invalidFile,
        'ERROR': '{{ERROR}}'
    });
    return (0, _creators.handleError)(error, { message, fatal: initial });
};

const makeUnknownBundlerInitError = error => {
    const message = _errors.UNKNOWN_BUNDLER_INITIALIZATION_ERROR;
    return (0, _creators.handleError)(error, { message, fatal: true });
};

const handleModifiedFile = (filename, invalidFile) => {
    debug('Attempting to handle modified file: %s', filename);
    const browserInstance = localState.get(browserBundler);
    const nodeInstance = localState.get(nodeBundler);
    const browserFile = invalidateFile(filename, browserInstance);
    debug('Invalidated in browser bundler: %s', browserFile);
    const nodeFile = invalidateFile(filename, nodeInstance);
    debug('Invalidated in node bundler: %s', nodeFile);
    debug('Checking if modified file is invalid: %s', invalidFile);
    if (invalidFile === filename) {
        debug('Yep file is invalid');
        return { type: _actionTypes.CLEAR_BUNDLER_INVALID_FILE };
    }
    debug('It appears that it is not.');
    debug('Checking if modified file is node only.');
    if (nodeFile && !browserFile) {
        debug('Yep file is node only.');
        return { type: _actionTypes.SET_BUNDLER_NODE_ONLY_FILE_MODIFIED };
    }
    debug('Execusing file.');
    return { type: _actionTypes.CLEAR_NEWLY_MODIFIED_FILE_FLAG };
};

const initializeBundlers = () => {
    const jspm = require('jspm');
    jspm.setPackagePath(_paths.ENV_PATH);
    const builder = jspm.Builder;
    const browserInstance = new builder(_paths.ENV_PATH, _files.ENV_JSPM_CONFIG_FILE);
    localState.set(browserBundler, browserInstance);
    const nodeInstance = new builder(_paths.ENV_PATH, _files.ENV_JSPM_CONFIG_FILE);
    localState.set(nodeBundler, nodeInstance);
};

const getInvalidFile = error => {
    if (!_lodash2.default.isObject(error) || !_lodash2.default.isString(error.message)) {
        return null;
    }
    const regex = /Loading\s{1}(.+\..+)\n/g;
    const result = [].concat(regex.exec(error.message));
    const relativeName = result[1];
    if (!_lodash2.default.isString(relativeName) || relativeName.length < 3) {
        return null;
    }
    const loader = localState.get(nodeBundler).loader;
    const absoluteName = loader.decanonicalize(relativeName);
    if (!_lodash2.default.isString(absoluteName) || absoluteName.length < 3) {
        return null;
    }
    const invalidFile = fromFileURL(absoluteName);
    if (!_lodash2.default.isString(invalidFile) || invalidFile.length < 3) {
        return null;
    }
    return invalidFile;
};

const fromFileURL = url => {
    const isWin = process.platform.match(/^win/);
    return url.substr(7 + !!isWin).replace(/\//g, _path2.default.sep);
};

const invalidateFile = (file, bundler) => {
    const invalidated = bundler.invalidate(file);
    return invalidated.length > 0;
};

exports.default = Bundler;