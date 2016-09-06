import Errorer from '../../../src/components/errorer.js'
import createStore from '../../../src/helpers/create-store.js'

const mock = NutraMock.getEntry('src/components/errorer.js')

describe ('Errorer()', () => {
    const breakPoints = {}
    describe ('BreakPoint#1', () => {
        let mockStore
        beforeAll(() => { mockStore = createStore() })
        afterAll(() => { breakPoints['BreakPoint#1'] = mockStore.getState() })
        it ('should watch for unhandled rejections', () => {
            const state = mockStore.getState()
            Errorer(mockStore)
            expect(mockStore.getState()).toEqual({
                ...state,
                error: {
                    ...state.error,
                    watchingRejections: true
                }
            })
        })
    })

    describe ('BreakPoint#2', () => {
        let mockStore
        beforeAll(() => {
            const state = breakPoints['BreakPoint#1']
            const errorInstance = new Error('Fatal Error!')
            mockStore = createStore({
                ...state,
                error: {
                    ...state.error,
                    fatal: true,
                    instance: errorInstance
                }
            })
        })
        afterAll(() => { breakPoints['BreakPoint#2'] = mockStore.getState() })
        it ('should notify the system that it is about to exit', () => {
            const state = mockStore.getState()
            Errorer(mockStore)
            expect(mockStore.getState()).toEqual({
                ...state,
                env: {
                    ...state.env,
                    prepareToExit: true
                }
            })
        })
    })

    describe ('BreakPoint', () => {
        let mockStore
        beforeAll(() => { mockStore = createStore(breakPoints['BreakPoint#1']) })
        it ('should do nothing', () => {
            const state = mockStore.getState()
            Errorer(mockStore)
            expect(state).toEqual(mockStore.getState())
        })
    })

    describe ('BreakPoint', () => {
        let mockStore
        beforeAll(() => { mockStore = createStore(breakPoints['BreakPoint#2']) })
        it ('should exit node process', () => {
            const logError = jasmine.createSpy('logError')
            mock.set('log', { error: logError })
            const nodeProcessExit = jasmine.createSpy('nodeProcessExit')
            mock.set('nodeProcess', { exit: nodeProcessExit })
            Errorer(mockStore)
            mock.reset('log')
            mock.reset('nodeProcess')
            const errorInstance = mockStore.getState().error.instance
            expect(logError).toHaveBeenCalledWith(errorInstance.stack)
            expect(nodeProcessExit).toHaveBeenCalledWith(1)
        })
    })
})
