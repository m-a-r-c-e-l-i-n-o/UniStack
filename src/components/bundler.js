import _ from 'lodash'
import path from 'path'
import createDebugger from 'debug'
import templatedText from '../helpers/templated-text.js'
import createLocalState from '../helpers/create-local-state.js'
import { ENV_JSPM_CONFIG_FILE } from '../constants/files.js'
import {
    ENV_PATH,
    ENV_BOOT_PATH
} from '../constants/paths.js'
import {
    ENV_BROWSER_ENTRY_FILE,
    ENV_BROWSER_BUNDLE_FILE,
    ENV_NODE_ENTRY_FILE,
    ENV_NODE_DEV_BUNDLE_FILE,
    ENV_NODE_BUNDLE_FILE
} from '../constants/files.js'
import {
    UNKNOWN_BUNDLE_BUILD_ERROR,
    UNKNOWN_BUNDLER_INITIALIZATION_ERROR,
    BUNDLE_BUILD_ERROR
} from '../constants/language/errors.js'
import {
    SET_BUNDLER_UPDATE_PREPARATIONS,
    CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS,
    CLEAR_BUNDLER_UPDATE_PREPARATIONS,
    CLEAR_NEWLY_MODIFIED_FILE_FLAG,
    SET_BUNDLER_NODE_ONLY_FILE_MODIFIED,
    CLEAR_BUNDLER_INVALID_FILE,
    CLEAR_BUNDLER_PENDING_REQUEST
} from '../constants/actionTypes.js'
import {
    handleError,
    saveBrowserBundleInstance,
    setBundlerInvalidFile
} from '../actions/creators.js'

const debug = createDebugger('unistack:bundler')

const browserBundler = 'browserBundler'
const nodeBundler = 'nodeBundler'
const localState = createLocalState(
    { initialized: false, browserBundler, nodeBundler }
)

const Bundler = ({ dispatch, getState }) => {
    const state = getState()
    const update = getStateLeaf(state, 'UPDATE')
    if (!update) return

    debug('Checking if local state needs to be initialized...')
    if (!localState.get('initialized')) {
        debug('Attempting to initialize the local state...')
        try {
            initializeBundlers()
            debug('Initialized the local state.')
            localState.set('initialized', true)
        } catch (error) {
            debug('Failed to initialize the local state.')
            return dispatch(makeUnknownBundlerInitError(error))
        }
    }

    debug('Checking if there is a newly modified file...')
    const initial = getStateLeaf(state, 'INITIAL')
    const invalidFile = getStateLeaf(state, 'INVALID_FILE')
    const modifiedFile = getStateLeaf(state, 'MODIFIED_FILE')
    if (!initial && modifiedFile) {
        debug('Yep, there is a modified file. Name: %s, Type: %s', modifiedFile.name, modifiedFile.type)
        return dispatch(handleModifiedFile(modifiedFile.name, invalidFile))
    }

    const updating = getStateLeaf(state, 'UPDATING')
    const pendingRequest = getStateLeaf(state, 'PENDING_REQUEST')
    debug('Checking if there is a bundle request pending...')
    if (!updating && pendingRequest) {
        debug('There is a pending bundler.')
        return dispatch({ type: CLEAR_BUNDLER_PENDING_REQUEST })
    }

    debug('Checking if bundler is worth is updating...')
    const filesInvalidated = getStateLeaf(state, 'FILES_INVALIDATED')
    if (filesInvalidated && !updating && !invalidFile) {
        debug('!!!!--Preparing to run bundlers.')
        dispatch({ type: SET_BUNDLER_UPDATE_PREPARATIONS })
        return runBundler()
        .then(() => {
            if (initial) {
                debug('@@@@--Initial bundles successfully created.')
                return dispatch({
                    type: CLEAR_BUNDLER_INITIAL_UPDATE_PREPARATIONS
                })
            }
            debug('@@@@--Bundlers ran successfully.')
            return dispatch({ type: CLEAR_BUNDLER_UPDATE_PREPARATIONS })
        })
        .catch(error => {
            debug('@@@@--Running bundler failed.')
            debug('Checking if it is an invalid file error...')
            const invalidFile = getInvalidFile(error)
            if (invalidFile) {
                debug('It appears that it is.')
                dispatch(setBundlerInvalidFile(invalidFile))
                return dispatch(makeInvalidFileError(error, invalidFile, initial))
            }
            debug('It appears that it is not.')
            debug('Issuing an unknown error.')
            dispatch({ type: CLEAR_BUNDLER_UPDATE_PREPARATIONS })
            return dispatch(makeUnknownBundleError(error, initial))
        })
    }
    debug('Nothing to do.')
}

const getStateLeaf = (state, leaf) => {
    switch(leaf) {
        case 'INITIAL':
            return state.bundler.initial
        case 'UPDATE':
            return state.bundler.update
        case 'UPDATING':
            return state.bundler.updating
        case 'PENDING_REQUEST':
            return state.bundler.pendingRequest
        case 'MODIFIED_FILE':
            return state.bundler.modifiedFile
        case 'FILES_INVALIDATED':
            return state.bundler.filesInvalidated
        case 'INVALID_FILE':
            return state.bundler.invalidFile
    }
}

const runBundler = () => {
    const buildOptions = {
        production: false,
        minify: false,
        mangle: false,
        sourceMaps: true,
        lowResSourceMaps: false
    }

    const browserInstance = localState.get(browserBundler)
    const browserBuildOptions = _.extend({}, buildOptions)
    const browserBundlePromise = browserInstance.bundle(
        ENV_BROWSER_ENTRY_FILE,
        ENV_BROWSER_BUNDLE_FILE,
        browserBuildOptions
    )

    const nodeBuildOptions = _.extend({}, {
        node: true,
        conditions: { 'unistack/unistats|platform': 'node' }
    }, buildOptions)

    const nodeInstance = localState.get(nodeBundler)
    const nodeBundlePromise = nodeInstance.buildStatic(
        ENV_NODE_ENTRY_FILE,
        ENV_NODE_DEV_BUNDLE_FILE,
        nodeBuildOptions
    )

    return Promise.all([browserBundlePromise, nodeBundlePromise])
}

const makeUnknownBundleError = (error, initial) => {
    const message = UNKNOWN_BUNDLE_BUILD_ERROR
    return handleError(error, { message, fatal: initial })
}

const makeInvalidFileError = (error, invalidFile, initial) => {
    const message = templatedText(BUNDLE_BUILD_ERROR, {
        'FILENAME': invalidFile,
        'ERROR': '{{ERROR}}'
    })
    return handleError(error, { message, fatal: initial })
}

const makeUnknownBundlerInitError = (error) => {
    const message = UNKNOWN_BUNDLER_INITIALIZATION_ERROR
    return handleError(error, { message, fatal: true })
}

const handleModifiedFile = (filename, invalidFile) => {
    debug('Attempting to handle modified file: %s', filename)
    const browserInstance = localState.get(browserBundler)
    const nodeInstance = localState.get(nodeBundler)
    const browserFile = invalidateFile(filename, browserInstance)
    debug('Invalidated in browser bundler: %s', browserFile)
    const nodeFile = invalidateFile(filename, nodeInstance)
    debug('Invalidated in node bundler: %s', nodeFile)
    debug('Checking if modified file is invalid: %s', invalidFile)
    if (invalidFile === filename) {
        debug('Yep file is invalid')
        return { type: CLEAR_BUNDLER_INVALID_FILE }
    }
    debug('It appears that it is not.')
    debug('Checking if modified file is node only.')
    if (nodeFile && !browserFile) {
        debug('Yep file is node only.')
        return { type: SET_BUNDLER_NODE_ONLY_FILE_MODIFIED }
    }
    debug('Execusing file.')
    return { type: CLEAR_NEWLY_MODIFIED_FILE_FLAG }
}

const initializeBundlers = () => {
    const jspm = require('jspm')
    jspm.setPackagePath(ENV_PATH)
    const builder = jspm.Builder
    const browserInstance = new builder(ENV_PATH, ENV_JSPM_CONFIG_FILE)
    localState.set(browserBundler, browserInstance)
    const nodeInstance = new builder(ENV_PATH, ENV_JSPM_CONFIG_FILE)
    localState.set(nodeBundler, nodeInstance)
}

const getInvalidFile = (error) => {
    if (!_.isObject(error) || !_.isString(error.message)) {
        return null
    }
    const regex = /Loading\s{1}(.+\..+)\n/g
    const result = ([]).concat(regex.exec(error.message))
    const relativeName = result[1]
    if (!_.isString(relativeName) || relativeName.length < 3) {
        return null
    }
    const loader = localState.get(nodeBundler).loader
    const absoluteName = loader.decanonicalize(relativeName)
    if (!_.isString(absoluteName) || absoluteName.length < 3) {
        return null
    }
    const invalidFile = fromFileURL(absoluteName)
    if (!_.isString(invalidFile) || invalidFile.length < 3) {
        return null
    }
    return invalidFile
}

const fromFileURL = (url) => {
  const isWin = process.platform.match(/^win/)
  return url.substr(7 + !!isWin).replace(/\//g, path.sep)
}

const invalidateFile = (file, bundler) => {
    const invalidated = bundler.invalidate(file)
    return (invalidated.length > 0)
}

export default Bundler
