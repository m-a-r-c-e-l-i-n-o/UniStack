'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
const base = 'Failed to create templated text.';

const MISMATCH_ERROR = `
${ base }
The following template place holders are missing or not valid:
"{{MISMATCHED_PLACE_HOLDERS}}"
Valid places holders: "{{PLACE_HOLDERS}}"
* Remember, the place holders' text should be all uppercase!
`;

const INVALID_RAW_TEXT = `
${ base }
The first (text) parameter has to be a plain string, but received:
"{{TYPE_RECEIVED}}"
`;

const INVALID_TEMPLATE = `
${ base }
The second (template) parameter has to be a plain object, but received:
"{{TYPE_RECEIVED}}"
`;

exports.MISMATCH_ERROR = MISMATCH_ERROR;
exports.INVALID_RAW_TEXT = INVALID_RAW_TEXT;
exports.INVALID_TEMPLATE = INVALID_TEMPLATE;