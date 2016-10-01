'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.environment = exports.server = undefined;

var _pathResolution = require('./helpers/path-resolution.js');

const server = exports.server = {
    hostName: 'localhost',
    serverPort: 8080,
    socketPort: 5776
};

const environment = exports.environment = {
    path: (0, _pathResolution.getEnvironmentPath)()
};