'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const HANDLE_ERROR = exports.HANDLE_ERROR = 'HANDLE_ERROR';
const SET_PACKAGER_INSTALLATION_PREPARATION = exports.SET_PACKAGER_INSTALLATION_PREPARATION = 'SET_PACKAGER_INSTALLATION_PREPARATION';
const CLEAR_PACKAGER_INSTALLATION_PREPARATION = exports.CLEAR_PACKAGER_INSTALLATION_PREPARATION = 'CLEAR_PACKAGER_INSTALLATION_PREPARATION';
const TOGGLE_ENV_INITIATED_FLAG = exports.TOGGLE_ENV_INITIATED_FLAG = 'TOGGLE_ENV_INITIATED_FLAG';
const SET_ENV_FILES_PRESENT_FLAG = exports.SET_ENV_FILES_PRESENT_FLAG = 'SET_ENV_FILES_PRESENT_FLAG';
const SET_ENV_POPULATED_FLAG = exports.SET_ENV_POPULATED_FLAG = 'SET_ENV_POPULATED_FLAG';
const TOGGLE_WATCHING_REJECTIONS_FLAG = exports.TOGGLE_WATCHING_REJECTIONS_FLAG = 'TOGGLE_WATCHING_REJECTIONS_FLAG';
const TOGGLE_PREPARE_TO_EXIT_FLAG = exports.TOGGLE_PREPARE_TO_EXIT_FLAG = 'TOGGLE_PREPARE_TO_EXIT_FLAG';
const CLEAR_NEWLY_MODIFIED_FILE_FLAG = exports.CLEAR_NEWLY_MODIFIED_FILE_FLAG = 'CLEAR_NEWLY_MODIFIED_FILE_FLAG';
const SET_WATCHER_MODIFIED_FILE = exports.SET_WATCHER_MODIFIED_FILE = 'SET_WATCHER_MODIFIED_FILE';
const SET_BUNDLER_UPDATE_PREPARATIONS = exports.SET_BUNDLER_UPDATE_PREPARATIONS = 'SET_BUNDLER_UPDATE_PREPARATIONS';
const CLEAR_BUNDLER_UPDATE_PREPARATIONS = exports.CLEAR_BUNDLER_UPDATE_PREPARATIONS = 'CLEAR_BUNDLER_UPDATE_PREPARATIONS';
const CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS = exports.CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS = 'CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS';
const SET_BUNDLER_NODE_ONLY_FILE_MODIFIED = exports.SET_BUNDLER_NODE_ONLY_FILE_MODIFIED = 'SET_BUNDLER_NODE_ONLY_FILE_MODIFIED';
const SET_BUNDLER_INVALID_FILE = exports.SET_BUNDLER_INVALID_FILE = 'SET_BUNDLER_INVALID_FILE';
const CLEAR_BUNDLER_INVALID_FILE = exports.CLEAR_BUNDLER_INVALID_FILE = 'CLEAR_BUNDLER_INVALID_FILE';
const CLEAR_BUNDLER_PENDING_REQUEST = exports.CLEAR_BUNDLER_PENDING_REQUEST = 'CLEAR_BUNDLER_PENDING_REQUEST';
const SET_SERVER_RESTART_PREPARATION = exports.SET_SERVER_RESTART_PREPARATION = 'SET_SERVER_RESTART_PREPARATION';
const CLEAR_SERVER_RESTART_PREPARATION = exports.CLEAR_SERVER_RESTART_PREPARATION = 'CLEAR_SERVER_RESTART_PREPARATION';
const SET_WATCHER_PREPARATIONS = exports.SET_WATCHER_PREPARATIONS = 'SET_WATCHER_PREPARATIONS';
const CLEAR_WATCHER_PREPARATIONS = exports.CLEAR_WATCHER_PREPARATIONS = 'CLEAR_WATCHER_PREPARATIONS';
const CLEAR_BROADCASTER_MESSAGE = exports.CLEAR_BROADCASTER_MESSAGE = 'CLEAR_BROADCASTER_MESSAGE';
const CLEAR_BROADCASTER_PREPARATIONS = exports.CLEAR_BROADCASTER_PREPARATIONS = 'CLEAR_BROADCASTER_PREPARATIONS';
const CLEAR_BROADCASTER_FILE_CHANGE = exports.CLEAR_BROADCASTER_FILE_CHANGE = 'CLEAR_BROADCASTER_FILE_CHANGE';
const SET_BROADCASTER_PREPARATIONS = exports.SET_BROADCASTER_PREPARATIONS = 'SET_BROADCASTER_PREPARATIONS';
const CLEAR_BROADCASTER_RELOAD = exports.CLEAR_BROADCASTER_RELOAD = 'CLEAR_BROADCASTER_RELOAD';