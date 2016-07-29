import IO from 'socket.io'
import ServerDestroy from 'server-destroy'
import { createServer as CreateServer } from 'http'
import UniStackCLI from '../../src/cli.js'
import State from '../../src/cli-state.js'
import Config from '../../config.js'

describe ('UniStackCLI', () => {
    it ('should be a function.', () => {
        expect(typeof UniStackCLI).toBe('function')
    })
})

describe ('UniStackCLI constructor()', () => {
    it ('should instantiate a cache object', () => {
        const unistack = new UniStackCLI()
        expect(typeof unistack.cache).toBe('object')
    })
})

describe ('UniStackCLI getState()', () => {
    it ('should return a state object', () => {
        const unistack = new UniStackCLI()
        expect(unistack.getState()).toEqual(State)
    })
    it ('should return a non-extendable object', () => {
        const unistack = new UniStackCLI()
        const state = unistack.getState()
        expect(() => state.hello = 'world')
        .toThrowError('Can\'t add property hello, object is not extensible')
    })
    it ('should cache state object', () => {
        const unistack = new UniStackCLI()
        const state = unistack.getState()
        expect(unistack.getState()).toBe(state)
    })
})

describe ('UniStackCLI start()', () => {
    it ('should return a promise', (done) => {
        const unistack = new UniStackCLI
        unistack.listenToEvents = () => Promise.resolve()
        const promise = unistack.start()
        expect(typeof promise.then).toBe('function')
        promise.then(done)
    })
    it ('should listen to events', (done) => {
        const unistack = new UniStackCLI
        unistack.listenToEvents = () => Promise.resolve()
        spyOn(unistack, 'listenToEvents').and.callThrough()
        unistack.start().then(done)
        .catch(e => console.error(e.stack))
        expect(unistack.listenToEvents).toHaveBeenCalledTimes(1)
    })
})


describe ('UniStackCLI listenToEvents()', () => {
    let originalTimeout
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
    })
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
    it ('should start message server', (done) => {
        const server = CreateServer()
        const io = IO(server)
        server.listen(Config.server.reloaderPort, () => {
            const unistack = new UniStackCLI
            unistack.listenToEvents().then(messageServer => {
                messageServer.on('disconnect', () => server.destroy(done))
                messageServer.disconnect()
            })
            .catch(e => console.error(e.stack))
        })
        ServerDestroy(server)
    })
    it ('should store the reloader server and io in state object', (done) => {
        const server = CreateServer()
        const io = IO(server)
        server.listen(Config.server.reloaderPort, () => {
            const unistack = new UniStackCLI
            unistack.listenToEvents().then(messageServer => {
                expect(unistack.cache.state.message.server).toBe(messageServer)
                expect(unistack.cache.state.message.io).toBe(messageServer.io)
                messageServer.on('disconnect', () => server.destroy(done))
                messageServer.disconnect()
            })
            .catch(e => console.error(e.stack))
        })
        ServerDestroy(server)
    })
})
