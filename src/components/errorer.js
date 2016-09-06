import createDebugger from 'debug'
import { gottaCatchEmAll } from 'gotta-catch-em-all'
import {
    TOGGLE_WATCHING_REJECTIONS_FLAG,
    TOGGLE_PREPARE_TO_EXIT_FLAG
} from '../constants/actionTypes.js'

const debug = createDebugger('unistack:errorer')

const nodeProcess = process
const log = console

const Errorer = ({ dispatch, getState }) => {
    const state = getState()
    const watchingRejections = getStateLeaf(state, 'WATCHING_REJECTIONS_FLAG')
    if (!watchingRejections) return dispatch(watchRejections())

    const fatalError = getStateLeaf(state, 'FATAL_ERROR_FLAG')
    const errorInstance = getStateLeaf(state, 'ERROR_INSTANCE')
    const prepareToExit = getStateLeaf(state, 'PREPARE_TO_EXIT_FLAG')
    if (!prepareToExit && errorInstance && fatalError) {
        return dispatch({ type: TOGGLE_PREPARE_TO_EXIT_FLAG })
    }

    if (prepareToExit) exitProcess(errorInstance)
}

const getStateLeaf = (state, leaf) => {
    switch(leaf) {
        case 'ERROR_INSTANCE':
            return state.error.instance
        case 'FATAL_ERROR_FLAG':
            return state.error.fatal
        case 'WATCHING_REJECTIONS_FLAG':
            return state.error.watchingRejections
        case 'PREPARE_TO_EXIT_FLAG':
            return state.env.prepareToExit
    }
}

const watchRejections = () => {
    debug('Attempting to watch rejections...')
    gottaCatchEmAll()
    debug('Watching rejections...')
    return { type: TOGGLE_WATCHING_REJECTIONS_FLAG }
}

const exitProcess = (errorInstance) => {
    log.error(errorInstance.stack)
    nodeProcess.exit(1)
}

export default Errorer
