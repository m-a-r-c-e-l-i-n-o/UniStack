'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
const base = 'Unable to complete local state operation.';
const KEY_NOT_REGISTERED_ERROR = `
${ base }
The "{{KEY}}" must be registered before it can be set.
Please register the key at the time of the local state creation.
`;

exports.KEY_NOT_REGISTERED_ERROR = KEY_NOT_REGISTERED_ERROR;