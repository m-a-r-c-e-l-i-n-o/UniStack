'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _creators = require('../actions/creators.js');

var _paths = require('../constants/paths.js');

var _actionTypes = require('../constants/actionTypes.js');

var _errors = require('../constants/language/errors.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('unistack:packager');

const Packager = (_ref) => {
    let getState = _ref.getState;
    let dispatch = _ref.dispatch;

    const state = getState();
    const installing = getStateLeaf(state, 'INSTALLING');
    const install = getStateLeaf(state, 'INSTALL');
    if (install && !installing) {
        try {
            debug('Checking if packages are already installed...');
            _fsExtra2.default.accessSync(_paths.ENV_NPM_PACKAGES_PATH, _fsExtra2.default.F_OK);
            _fsExtra2.default.accessSync(_paths.ENV_JSPM_PACKAGES_PATH, _fsExtra2.default.F_OK);
            debug('Yep, their are installed.');
            return dispatch({ type: _actionTypes.CLEAR_PACKAGER_INSTALLATION_PREPARATION });
        } catch (e) {
            debug('!!!!--Preparing to install packages...');
            dispatch({ type: _actionTypes.SET_PACKAGER_INSTALLATION_PREPARATION });
        }
        return installPackages().then(() => {
            debug('@@@@--Installed packages');
            return dispatch({ type: _actionTypes.CLEAR_PACKAGER_INSTALLATION_PREPARATION });
        }).catch(error => {
            debug('@@@@--Failed to install packages %s', error.stack);
            return dispatch(makePackageInstallError(error));
        });
    }
};

const getStateLeaf = (state, leaf) => {
    switch (leaf) {
        case 'INSTALL':
            return state.packager.install;
        case 'INSTALLING':
            return state.packager.installing;
    }
};

const installPackages = () => {
    const jspmExecutable = _path2.default.join(_paths.ENV_NPM_PACKAGES_PATH, '.bin', 'jspm');
    const command = `npm install && yes | ${ jspmExecutable } install`;
    const envPath = _paths.ENV_PATH;
    const options = { cwd: envPath };
    return new Promise((resolve, reject) => {
        debug('Running packages install command: %s', command);
        debug('This will likely take a few minutes...');
        _child_process2.default.exec(command, options, (error, stdout, stderr) => {
            if (error) return reject(error);
            resolve(true);
        });
    });
};

const makePackageInstallError = error => {
    const message = _errors.UNKNOWN_PACKAGE_INSTALL_ERROR;
    return (0, _creators.handleError)(error, { message, fatal: true });
};

exports.default = Packager;