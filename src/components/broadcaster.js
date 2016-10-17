import path from 'path'
import createDebugger from 'debug'
import serverDestroy from 'server-destroy'
import socketIO from 'socket.io'
import { createServer  } from 'http'
import { ENV_PATH } from '../constants/paths.js'
import {
    SET_BROADCASTER_PREPARATIONS,
    CLEAR_BROADCASTER_PREPARATIONS,
    CLEAR_BROADCASTER_MESSAGE,
    CLEAR_BROADCASTER_FILE_CHANGE,
    CLEAR_BROADCASTER_RELOAD
} from '../constants/actionTypes.js'
import { setModifiedFile, handleError } from '../actions/creators.js'

const debug = createDebugger('unistack:broadcaster')

const server = createServer()
const io = socketIO(server)
const sockets = new Set([])

const Broadcaster = ({ dispatch, getState }) => {
    const state = getState()
    const broadcast = getStateLeaf(state, 'BROADCAST')
    const broadcasting = getStateLeaf(state, 'BROADCASTING')
    // debug('Checking if server needs to be initialized...')
    if (broadcast && !broadcasting) {
        debug('!!!!--Preparing to initialize socket server...')
        dispatch({ type: SET_BROADCASTER_PREPARATIONS })
        io.on('connection', socket => {
            sockets.add(socket)
            socket.on('disconnect', () => {
                sockets.delete(socket)
            })
            socket.on('identification', name => {
                debug('Connected client: %s', name)
            })
        })
        return new Promise((resolve, reject) => {
            server.listen(5776, error => {
                if (error) reject(error)
                resolve({ server, io })
            })
            serverDestroy(server)
        })
        .then(() => {
            debug('@@@@--Successfully initialized server at port 5776!')
            return dispatch({ type: CLEAR_BROADCASTER_PREPARATIONS })
        })
        .catch(error => {
            debug('@@@@--Failed to initialize server: %s', error.stack)
        })
    }

    const message = getStateLeaf(state, 'MESSAGE')
    // debug('Checking if a there is a message to share...')
    if (message) {
        debug('Yep, we sure do.')
        console.log(message)
        sockets.forEach(socket => {
            debug('Emitting to sockets')
            socket.emit('message', message)
        })
        return dispatch({ type: CLEAR_BROADCASTER_MESSAGE })
    }

    // debug('Checking if a browser reload is needed...')
    const reload = getStateLeaf(state, 'RELOAD')
    if (reload) {
        debug('Yep, we sure do.')
        console.log('Reloading browser!')
        sockets.forEach(socket => {
            debug('Emitting to sockets')
            socket.emit('reload')
        })
        return dispatch({ type: CLEAR_BROADCASTER_RELOAD })
    }

    // debug('Checking if there was a file change event...')
    const fileChange = getStateLeaf(state, 'FILE_CHANGE')
    if (fileChange) {
        debug('Yep, there was file change: %s %s', fileChange.name, fileChange.type)
        const absolutePath = fileChange.name
        const relativePath = path.relative(ENV_PATH, absolutePath)
        console.log(`File (${fileChange.type}): ${relativePath}`)
        sockets.forEach(socket => {
            debug('Emitting to sockets %s - %s', relativePath, absolutePath)
            socket.emit('change', { path: relativePath, absolutePath })
        })
        return dispatch({ type: CLEAR_BROADCASTER_FILE_CHANGE })
    }
    // debug('Nothing to do.')
}

const getStateLeaf = (state, leaf) => {
    switch(leaf) {
        case 'BROADCAST':
            return state.broadcaster.broadcast
        case 'BROADCASTING':
            return state.broadcaster.broadcasting
        case 'MESSAGE':
            return state.broadcaster.message
        case 'RELOAD':
            return state.broadcaster.reload
        case 'FILE_CHANGE':
            return state.broadcaster.fileChange
    }
}

export default Broadcaster
