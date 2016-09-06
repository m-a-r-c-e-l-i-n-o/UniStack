import path from 'path'
import createDebugger from 'debug'
import Gaze from 'gaze'
import { modifiedFile } from '../helpers/formatted-file.js'
import { ENV_BOOT_PATH } from '../constants/paths.js'
import {
    SET_WATCHER_PREPARATIONS,
    CLEAR_WATCHER_PREPARATIONS
} from '../constants/actionTypes.js'
import { setWatcherModifiedFile, handleError } from '../actions/creators.js'

const debug = createDebugger('unistack:watcher')

const Watcher = ({ dispatch, getState }) => {
    const state = getState()
    const watch = getStateLeaf(state, 'WATCH')
    const watching = getStateLeaf(state, 'WATCHING')
    debug('Checking if it is worth watching the files...')
    if (watch && !watching) {
        debug('!!!!--Preparing to watch files from ')
        dispatch({ type: SET_WATCHER_PREPARATIONS })
        const gaze = new Gaze(path.join(ENV_BOOT_PATH, 'src', '**/*'))
        gaze.on('all', (event, filepath) => {
            const formattedFile = modifiedFile(filepath, event)
            debug('Emitting file change: %s - %s', event, filepath)
            return dispatch(setWatcherModifiedFile(formattedFile))
        })
        gaze.on('ready', () => {
            debug('@@@@--Successfully watching files...')
            return dispatch({ type: CLEAR_WATCHER_PREPARATIONS })
        })
        gaze.on('error', error => {
            debug('@@@@--Failed to watch files, %s', error.stack)
            return dispatch(handleError(error))
        })
    }
    debug('Nothing to do.')
}

const getStateLeaf = (state, leaf) => {
    switch(leaf) {
        case 'WATCH':
            return state.watcher.watch
        case 'WATCHING':
            return state.watcher.watching
    }
}

export default Watcher
