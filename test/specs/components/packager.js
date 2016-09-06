import fs from 'fs-extra'
import path from 'path'
import Packager from '../../../src/components/packager.js'
import createStore from '../../../src/helpers/create-store.js'
import {
    ENV_PATH,
    UNI_ENV_PATH,
    ENV_NPM_PACKAGES_PATH,
    ENV_JSPM_PACKAGES_PATH
} from '../../../src/constants/paths.js'
import {
    UNKNOWN_PACKAGE_INSTALL_ERROR
} from '../../../src/constants/language/errors.js'

const mock = NutraMock.getEntry('src/components/packager.js')

describe ('Packager()', () => {
    const breakPoints = {}
    describe ('BreakPoint#1', () => {
        let mockStore
        beforeAll(() => {
            const initialState = createStore().getState()
            mockStore = createStore({
                ...initialState,
                packager: {
                    ...initialState.packager,
                    install: true
                }
            })
        })
        afterAll(() => { breakPoints['BreakPoint#1'] = mockStore.getState() })
        it ('should set the initial dependent state', () => {})
    })

    describe ('BreakPoint', () => {
        let mockStore
        beforeAll(() => {
            const initialState = createStore().getState()
            mockStore = createStore(breakPoints['BreakPoint#1'])
        })
        it ('should handle failures to install packages', (done) => {
            const state = mockStore.getState()
            mock.set('ENV_PATH', '/path/to/no/where')
            Packager(mockStore).then(e => {
                const errorState = mockStore.getState().error
                const errorMessage = UNKNOWN_PACKAGE_INSTALL_ERROR
                const suffixIndex = errorMessage.indexOf('Actual Error')
                const suffix = errorMessage.slice(0, suffixIndex - 1).trim()
                expect(errorState.instance.message.startsWith(suffix)).toBe(true)
                done()
            })
            .catch(e => console.log(e.stack))
            mock.reset('ENV_PATH')
        })
    })

    if (!process.env.QUICK_TEST_RUN) {
        describe ('BreakPoint', () => {
            let mockStore
            let defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
            beforeAll(() => {
                console.log('-Installing environment packages...')
                mockStore = createStore(breakPoints['BreakPoint#1'])
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000 // 10 minutes
                fs.copySync(UNI_ENV_PATH, ENV_PATH)
            })
            afterAll(() => {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout
                fs.removeSync(ENV_PATH)
                console.log('-Done installing environment packages...')
            })
            it ('should install packages', (done) => {
                const prevPackagerState = mockStore.getState().packager
                expect(prevPackagerState).toEqual({
                    ...prevPackagerState,
                    install: true,
                    installing: false
                })
                Packager(mockStore).then(() => {
                    expect(() => fs.accessSync(ENV_NPM_PACKAGES_PATH, fs.F_OK))
                    .not.toThrowError()
                    expect(() => fs.accessSync(ENV_JSPM_PACKAGES_PATH, fs.F_OK))
                    .not.toThrowError()
                    expect(mockStore.getState().packager).toEqual({
                        ...prevPackagerState,
                        install: false,
                        installing: false
                    })
                    done()
                })
                .catch(e => console.log(e.stack))
            })
            it ('should do nothing as long as packages are installed', () => {
                const mockStore = createStore()
                const state = mockStore.getState()
                Packager(mockStore)
                expect(state).toEqual(mockStore.getState())
            })
        })
    }

    describe ('BreakPoint', () => {
        it ('should do nothing', () => {
            const mockStore = createStore()
            const state = mockStore.getState()
            Packager(mockStore)
            expect(state).toEqual(mockStore.getState())
        })
    })
})
