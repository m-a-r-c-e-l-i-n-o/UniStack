'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isDirFilesInDir = exports.walkDirSync = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const walkDirSync = (dir, filelist, baseDir) => {
    const files = _fs2.default.readdirSync(dir);
    filelist = filelist || [];
    baseDir = baseDir || dir;
    files.forEach(file => {
        if (_fs2.default.statSync(dir + '/' + file).isDirectory()) {
            filelist = walkDirSync(dir + '/' + file, filelist, baseDir);
        } else {
            filelist.push(_path2.default.join(dir.replace(baseDir, ''), file));
        }
    });
    return filelist;
};

const isDirFilesInDir = (aDir, bDir) => {
    const aFiles = walkDirSync(aDir);
    const bFiles = walkDirSync(bDir);
    return _lodash2.default.intersection(aFiles, bFiles).length === aFiles.length;
};

exports.walkDirSync = walkDirSync;
exports.isDirFilesInDir = isDirFilesInDir;