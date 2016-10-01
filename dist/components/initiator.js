'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _dirAnalyzer = require('../helpers/dir-analyzer.js');

var _paths = require('../constants/paths.js');

var _files = require('../constants/files.js');

var _errors = require('../constants/language/errors.js');

var _actionTypes = require('../constants/actionTypes.js');

var _creators = require('../actions/creators.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('unistack:initiator');

const Initiator = (_ref) => {
    let dispatch = _ref.dispatch;
    let getState = _ref.getState;

    const state = getState();
    const envInitiated = getStateLeaf(state, 'ENV_INITIATED_FLAG');
    if (envInitiated) return;

    const envFilesPresent = getStateLeaf(state, 'ENV_FILES_PRESENT_FLAG');
    if (envFilesPresent === null) return dispatch(isEnvFilesPresent());

    const envPopulated = getStateLeaf(state, 'ENV_POPULATED_FLAG');
    if (envFilesPresent === false) {
        switch (envPopulated) {
            case null:
                return dispatch(isEnvIsPopulated());
            case true:
                return dispatch(makeEnvPopulatedError());
            case false:
                return dispatch(setupNewEnv());
        }
    }

    const validPackageJSON = validatePackageJSON();
    if (validPackageJSON !== true) return dispatch(validPackageJSON);

    return dispatch({ type: _actionTypes.TOGGLE_ENV_INITIATED_FLAG });
};

const getStateLeaf = (state, leaf) => {
    switch (leaf) {
        case 'ENV_INITIATED_FLAG':
            return state.env.initiated;
        case 'ENV_FILES_PRESENT_FLAG':
            return state.env.filesPresent;
        case 'ENV_POPULATED_FLAG':
            return state.env.populated;
    }
};

const validatePackageJSON = () => {
    const packageJSON = getEnvPackageJSON();
    if (packageJSON instanceof Error || !_lodash2.default.isPlainObject(packageJSON)) {
        const message = _errors.UNKNOWN_ENV_PACKAGE_JSON_ERROR;
        return (0, _creators.handleError)(packageJSON, { message, fatal: true });
    }
    if (!packageJSON.unistack) {
        return makeLikelyNotUniEnvError();
    }
    return true;
};

const makeEnvPopulatedError = () => {
    const error = new Error(_errors.INSTALLATION_DIRECTORY_NOT_EMPTY);
    return (0, _creators.handleError)(error, { fatal: true });
};

const makeLikelyNotUniEnvError = () => {
    const error = new Error(_errors.LIKELY_NOT_UNI_ENV);
    return (0, _creators.handleError)(error);
};

const isEnvFilesPresent = () => {
    debug('Checking if environment file are present');
    const status = (0, _dirAnalyzer.isDirFilesInDir)(_paths.UNI_ENV_PATH, _paths.ENV_PATH);
    return (0, _creators.setEnvFilesPresentFlag)(status);
};

const isEnvIsPopulated = () => {
    debug('Checking if environment is populated');
    const status = isEnvPopulated();
    if (status instanceof Error) {
        const message = _errors.UNKNOWN_ENV_DIRECTORY_ERROR;
        return (0, _creators.handleError)(status, { message, fatal: true });
    }
    return (0, _creators.setEnvPopulatedFlag)(status);
};

const setupNewEnv = () => {
    debug('Setting up new environment');
    const status = copyUniEnvToEnv();
    if (status instanceof Error) {
        const message = _errors.UNKNOWN_ENV_COPY_ERROR;
        return (0, _creators.handleError)(status, { message, fatal: true });
    }
    return (0, _creators.setEnvFilesPresentFlag)(status);
};

const copyUniEnvToEnv = () => {
    try {
        _fsExtra2.default.copySync(_paths.UNI_ENV_PATH, _paths.ENV_PATH);
        return true;
    } catch (e) {
        return e;
    }
};

const getEnvPackageJSON = () => {
    try {
        return require(_files.ENV_PACKAGE_JSON_FILE);
    } catch (e) {
        return e;
    }
};

const isEnvPopulated = () => {
    try {
        const files = _fsExtra2.default.readdirSync(_paths.ENV_PATH);
        return files.length === 0 ? false : true;
    } catch (e) {
        return e;
    }
};

exports.default = Initiator;