import createDebugger from 'debug'
import serverDestroy from 'server-destroy'
import { ENV_NODE_DEV_BUNDLE_FILE } from '../constants/files.js'
import {
    UNKNOWN_SERVER_ERROR,
} from '../constants/language/errors.js'
import {
    SET_SERVER_RESTART_PREPARATION,
    CLEAR_SERVER_RESTART_PREPARATION
} from '../constants/actionTypes.js'
import { handleError } from '../actions/creators.js'
import createLocalState from '../helpers/create-local-state.js'

const debug = createDebugger('unistack:server')

const serverKey = 'server'
const localState = createLocalState({
    server: { destroy: () => Promise.resolve() }
})

const Server = ({ dispatch, getState }) => {
    const state = getState()
    const serve = getStateLeaf(state, 'SERVE')
    const restart = getStateLeaf(state, 'RESTART')
    const worthRestartingNow = getStateLeaf(state, 'WORTH_RESTARTING_NOW')
    debug('Checking if it is worth restarting the server...')
    if (restart && worthRestartingNow) {
        debug('!!!!--Preparing to restart the server.')
        dispatch({ type: SET_SERVER_RESTART_PREPARATION })
        return restartServer()
        .then(() => dispatch({ type: CLEAR_SERVER_RESTART_PREPARATION }))
        .catch(error => {
            debug('@@@@--Failed at restarting the server: %s', error.stack)
            return dispatch(makeUnknownServerError(error))
        })
    }
    debug('Nothing to do.')
}

const getStateLeaf = (state, leaf) => {
    switch(leaf) {
        case 'SERVE':
            return state.server.serve
        case 'RESTART':
            return state.server.restart
        case 'WORTH_RESTARTING_NOW':
            return state.server.worthRestartingNow
    }
}

const makeUnknownServerError = (error) => {
    const message = UNKNOWN_SERVER_ERROR
    return handleError(error, { message })
}

const loadServer = () => {
    debug('!!!!--Requiring node bundle...')
    delete require.cache[ENV_NODE_DEV_BUNDLE_FILE]
    const result = require(ENV_NODE_DEV_BUNDLE_FILE).serve
    console.log('result', result)
    debug('@@@@--Node bundle successfully required.')
    return result
}

const restartServer = () => {
    return localState
    .get(serverKey)
    .destroy()
    .then(loadServer)
    .then(serverInstance => {
        serverDestroy(serverInstance)
        const promisifiedDestroy = () => new Promise(
            resolve => serverInstance.destroy(resolve)
        )
        localState.set(serverKey, { destroy: promisifiedDestroy })
        debug('@@@@--Server successfully restarted.')
    })
}

export default Server
