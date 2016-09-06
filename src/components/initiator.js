import _ from 'lodash'
import fs from 'fs-extra'
import createDebugger from 'debug'
import { isDirFilesInDir } from '../helpers/dir-analyzer.js'
import { ENV_PATH, UNI_ENV_PATH } from '../constants/paths.js'
import { ENV_PACKAGE_JSON_FILE } from '../constants/files.js'
import {
    INSTALLATION_DIRECTORY_NOT_EMPTY,
    UNKNOWN_ENV_DIRECTORY_ERROR,
    UNKNOWN_ENV_COPY_ERROR,
    UNKNOWN_ENV_PACKAGE_JSON_ERROR,
    LIKELY_NOT_UNI_ENV
} from '../constants/language/errors.js'
import { TOGGLE_ENV_INITIATED_FLAG } from '../constants/actionTypes.js'
import {
    handleError, setEnvFilesPresentFlag, setEnvPopulatedFlag
} from '../actions/creators.js'

const debug = createDebugger('unistack:initiator')

const Initiator = ({ dispatch, getState }) => {
    const state = getState()
    const envInitiated = getStateLeaf(state, 'ENV_INITIATED_FLAG')
    if (envInitiated) return

    const envFilesPresent = getStateLeaf(state, 'ENV_FILES_PRESENT_FLAG')
    if (envFilesPresent === null) return dispatch(isEnvFilesPresent())

    const envPopulated = getStateLeaf(state, 'ENV_POPULATED_FLAG')
    if (envFilesPresent === false) {
        switch(envPopulated) {
            case null:
                return dispatch(isEnvIsPopulated())
            case true:
                return dispatch(makeEnvPopulatedError())
            case false:
                return dispatch(setupNewEnv())
        }
    }

    const validPackageJSON = validatePackageJSON()
    if (validPackageJSON !== true) return dispatch(validPackageJSON)

    return dispatch({ type: TOGGLE_ENV_INITIATED_FLAG })
}

const getStateLeaf = (state, leaf) => {
    switch(leaf) {
        case 'ENV_INITIATED_FLAG':
            return state.env.initiated
        case 'ENV_FILES_PRESENT_FLAG':
            return state.env.filesPresent
        case 'ENV_POPULATED_FLAG':
            return state.env.populated
    }
}

const validatePackageJSON = () => {
    const packageJSON = getEnvPackageJSON()
    if (packageJSON instanceof Error || !_.isPlainObject(packageJSON)) {
        const message = UNKNOWN_ENV_PACKAGE_JSON_ERROR
        return handleError(packageJSON, { message, fatal: true })
    }
    if (!packageJSON.unistack) {
        return makeLikelyNotUniEnvError()
    }
    return true
}

const makeEnvPopulatedError = () => {
    const error = new Error(INSTALLATION_DIRECTORY_NOT_EMPTY)
    return handleError(error, { fatal: true })
}

const makeLikelyNotUniEnvError = () => {
    const error = new Error(LIKELY_NOT_UNI_ENV)
    return handleError(error)
}

const isEnvFilesPresent = () => {
    debug('Checking if environment file are present')
    const status = isDirFilesInDir(UNI_ENV_PATH, ENV_PATH)
    return setEnvFilesPresentFlag(status)
}

const isEnvIsPopulated = () => {
    debug('Checking if environment is populated')
    const status = isEnvPopulated()
    if (status instanceof Error) {
        const message = UNKNOWN_ENV_DIRECTORY_ERROR
        return handleError(status, { message, fatal: true })
    }
    return setEnvPopulatedFlag(status)
}

const setupNewEnv = () => {
    debug('Setting up new environment')
    const status = copyUniEnvToEnv()
    if (status instanceof Error) {
        const message = UNKNOWN_ENV_COPY_ERROR
        return handleError(status, { message, fatal: true })
    }
    return setEnvFilesPresentFlag(status)
}

const copyUniEnvToEnv = () => {
    try {
        fs.copySync(UNI_ENV_PATH, ENV_PATH)
        return true
    } catch (e) { return e }
}

const getEnvPackageJSON = () => {
    try {
        return require(ENV_PACKAGE_JSON_FILE)
    } catch (e) { return e }
}

const isEnvPopulated = () => {
    try {
        const files = fs.readdirSync(ENV_PATH)
        return (files.length === 0 ? false : true)
    } catch (e) { return e }
}

export default Initiator
