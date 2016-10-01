'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ENV_DIST_PATH = exports.ENV_JSPM_PACKAGES_PATH = exports.ENV_NPM_PACKAGES_PATH = exports.ENV_BOOT_PATH = exports.ENV_PATH = exports.UNI_ENV_BOOT_PATH = exports.UNI_ENV_PATH = exports.UNI_TEMP_TEST_PATH = exports.UNI_TEST_PATH = exports.UNI_TEMP_PATH = exports.UNI_PATH = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('../config.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const UNI_PATH = _path2.default.join(__dirname, '..', '..');
const UNI_TEMP_PATH = _path2.default.join(UNI_PATH, 'temp');
const UNI_TEST_PATH = _path2.default.join(UNI_PATH, 'test');
const UNI_TEMP_TEST_PATH = _path2.default.join(UNI_TEMP_PATH, 'test');
const UNI_ENV_PATH = _path2.default.join(UNI_PATH, 'environment');
const UNI_ENV_BOOT_PATH = _path2.default.join(UNI_ENV_PATH, 'bootstrap');
const ENV_PATH = _config.environment.path;
const ENV_DIST_PATH = _path2.default.join(ENV_PATH, 'dist');
const ENV_BOOT_PATH = _path2.default.join(ENV_PATH, 'bootstrap');
const ENV_JSPM_PACKAGES_PATH = _path2.default.join(ENV_BOOT_PATH, 'jspm_packages');
const ENV_NPM_PACKAGES_PATH = _path2.default.join(ENV_PATH, 'node_modules');

exports.UNI_PATH = UNI_PATH;
exports.UNI_TEMP_PATH = UNI_TEMP_PATH;
exports.UNI_TEST_PATH = UNI_TEST_PATH;
exports.UNI_TEMP_TEST_PATH = UNI_TEMP_TEST_PATH;
exports.UNI_ENV_PATH = UNI_ENV_PATH;
exports.UNI_ENV_BOOT_PATH = UNI_ENV_BOOT_PATH;
exports.ENV_PATH = ENV_PATH;
exports.ENV_BOOT_PATH = ENV_BOOT_PATH;
exports.ENV_NPM_PACKAGES_PATH = ENV_NPM_PACKAGES_PATH;
exports.ENV_JSPM_PACKAGES_PATH = ENV_JSPM_PACKAGES_PATH;
exports.ENV_DIST_PATH = ENV_DIST_PATH;