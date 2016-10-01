'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ENV_NODE_BUNDLE_FILE = exports.ENV_NODE_DEV_BUNDLE_FILE = exports.ENV_NODE_ENTRY_FILE = exports.ENV_BROWSER_BUNDLE_FILE = exports.ENV_BROWSER_ENTRY_FILE = exports.ENV_JSPM_CONFIG_FILE = exports.ENV_PACKAGE_JSON_FILE = exports.UNI_ENV_JSPM_CONFIG_FILE = exports.UNI_ENV_PACKAGE_JSON_FILE = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _paths = require('./paths.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const UNI_ENV_PACKAGE_JSON_FILE = exports.UNI_ENV_PACKAGE_JSON_FILE = _path2.default.join(_paths.UNI_ENV_PATH, 'package.json');
const UNI_ENV_JSPM_CONFIG_FILE = exports.UNI_ENV_JSPM_CONFIG_FILE = _path2.default.join(_paths.UNI_ENV_BOOT_PATH, 'jspm.config.js');
const ENV_PACKAGE_JSON_FILE = exports.ENV_PACKAGE_JSON_FILE = _path2.default.join(_paths.ENV_PATH, 'package.json');
const ENV_JSPM_CONFIG_FILE = exports.ENV_JSPM_CONFIG_FILE = _path2.default.join(_paths.ENV_BOOT_PATH, 'jspm.config.js');
const ENV_BROWSER_ENTRY_FILE = exports.ENV_BROWSER_ENTRY_FILE = _path2.default.join(_paths.ENV_BOOT_PATH, 'src', 'browser.js');
const ENV_BROWSER_BUNDLE_FILE = exports.ENV_BROWSER_BUNDLE_FILE = _path2.default.join(_paths.ENV_DIST_PATH, 'browser.bundle.js');
const ENV_NODE_ENTRY_FILE = exports.ENV_NODE_ENTRY_FILE = _path2.default.join(_paths.ENV_BOOT_PATH, 'src', 'node.js');
const ENV_NODE_DEV_BUNDLE_FILE = exports.ENV_NODE_DEV_BUNDLE_FILE = _path2.default.join(_paths.ENV_DIST_PATH, 'node.dev.bundle.js');
const ENV_NODE_BUNDLE_FILE = exports.ENV_NODE_BUNDLE_FILE = _path2.default.join(_paths.ENV_DIST_PATH, 'node.bundle.js');