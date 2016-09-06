import broadcaster from './broadcaster.js'
import packager from './packager.js'
import watcher from './watcher.js'
import bundler from './bundler.js'
import server from './server.js'
import error from './error.js'
import env from './env.js'
import { combineReducers } from 'redux'

const reducers = combineReducers({
    broadcaster,
    packager,
    watcher,
    bundler,
    server,
    error,
    env
})

export default reducers
