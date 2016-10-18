import path from 'path'
import createDebugger from 'debug'
import chokidar from 'chokidar'
import { modifiedFile } from '../helpers/formatted-file.js'
import { ENV_PATH } from '../constants/paths.js'
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
    // debug('Checking if it is worth watching the files...')
    if (watch && !watching) {
        const files = [
            path.join('src', '**/*'),
            path.join('dist', 'css'),
            path.join('bootstrap', 'src')
        ]
        debug('!!!!--Preparing to watch files!!!!!!!!!!1: %s', files)
        dispatch({ type: SET_WATCHER_PREPARATIONS })
        const watcherSettings = { cwd: ENV_PATH, ignoreInitial: true }
        const watcher = chokidar.watch(files, watcherSettings)

        watcher.on('add', filepath => (
            dispatch(handleFileMofidication('add', filepath))
        ))
        watcher.on('change', filepath => (
            dispatch(handleFileMofidication('change', filepath))
        ))
        watcher.on('unlink', filepath => (
            dispatch(handleFileMofidication('unlink', filepath))
        ))
        watcher.on('ready', () => {
            debug('@@@@--Successfully watching files...')
            return dispatch({ type: CLEAR_WATCHER_PREPARATIONS })
        })
        watcher.on('error', error => {
            debug('@@@@--Failed to watch files, %s', error.stack)
            return dispatch(handleError(error))
        })
    }
    // debug('Nothing to do.')
}

const getStateLeaf = (state, leaf) => {
    switch(leaf) {
        case 'WATCH':
            return state.watcher.watch
        case 'WATCHING':
            return state.watcher.watching
    }
}

const handleFileMofidication = (event, filepath) => {
    const absoluteFilepath = path.join(ENV_PATH, filepath)
    debug('Emitting file change: %s - %s', event, absoluteFilepath)
    const formattedFile = modifiedFile(absoluteFilepath, event)
    return setWatcherModifiedFile(formattedFile)
}

export default Watcher
