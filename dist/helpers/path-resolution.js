'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getEnvironmentPath = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const uniPath = _path2.default.join(__dirname, '..', '..');

const getEnvironmentPath = () => {
    if (process.cwd() === uniPath) {
        return _path2.default.join(uniPath, 'test', 'environment');
    } else {
        return process.cwd();
    }
};

exports.getEnvironmentPath = getEnvironmentPath;