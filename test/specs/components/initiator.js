import fs from 'fs-extra'
import path from 'path'
import fileExist from 'file-exists'
import Initiator from '../../../src/components/initiator.js'
import createStore from '../../../src/helpers/create-store.js'
import { isDirFilesInDir } from '../../../src/helpers/dir-analyzer.js'
import {
    ENV_PATH,
    UNI_ENV_PATH
} from '../../../src/constants/paths.js'
import {
    ENV_PACKAGE_JSON_FILE
} from '../../../src/constants/files.js'
import {
    INSTALLATION_DIRECTORY_NOT_EMPTY,
    UNKNOWN_ENV_PACKAGE_JSON_ERROR,
    UNKNOWN_ENV_DIRECTORY_ERROR,
    UNKNOWN_ENV_COPY_ERROR,
    LIKELY_NOT_UNI_ENV
} from '../../../src/constants/language/errors.js'

const mock = NutraMock.getEntry('src/components/initiator.js')

describe ('Initiator()', () => {
    const breakPoints = {}
    describe ('BreakPoint#1', () => {
        let mockStore
        beforeAll(() => { mockStore = createStore() })
        afterAll(() => { breakPoints['BreakPoint#1'] = mockStore.getState() })
        it ('should check if the environment does not have the necessary files', () => {
            const state = mockStore.getState()
            Initiator(mockStore)
            expect(mockStore.getState()).toEqual({
                ...state,
                env: {
                    ...state.env,
                    filesPresent: false
                }
            })
        })
    })

    describe ('BreakPoint#2', () => {
        let mockStore
        beforeAll(() => { mockStore = createStore() })
        afterAll(() => { breakPoints['BreakPoint#2'] = mockStore.getState() })
        it ('should check if the environment has the necessary files', () => {
            fs.copySync(UNI_ENV_PATH, ENV_PATH)
            const state = mockStore.getState()
            Initiator(mockStore)
            expect(mockStore.getState()).toEqual({
                ...state,
                env: {
                    ...state.env,
                    filesPresent: true
                }
            })
            fs.emptyDirSync(ENV_PATH)
        })
    })

    describe ('BreakPoint#3', () => {
        let mockStore
        beforeAll(() => { mockStore = createStore(breakPoints['BreakPoint#1']) })
        afterAll(() => { breakPoints['BreakPoint#3'] = mockStore.getState() })
        it ('should check if the environment is empty', () => {
            const state = mockStore.getState()
            Initiator(mockStore)
            expect(mockStore.getState()).toEqual({
                ...state,
                env: {
                    ...state.env,
                    populated: false
                }
            })
        })
    })

    describe ('BreakPoint', () => {
        let mockStore
        beforeAll(() => { mockStore = createStore(breakPoints['BreakPoint#3']) })
        it ('should handle failures when setting the environment files', () => {
            mock.set('UNI_ENV_PATH', 'path/to/no/where')
            Initiator(mockStore)
            mock.reset('UNI_ENV_PATH')
            const errorState = mockStore.getState().error
            const errorMessage = UNKNOWN_ENV_COPY_ERROR
            const suffixIndex = errorMessage.indexOf('Actual Error')
            const suffix = errorMessage.slice(0, suffixIndex - 1).trim()
            expect(errorState.instance.message.startsWith(suffix)).toBe(true)
        })
    })

    describe ('BreakPoint', () => {
        let mockStore
        beforeAll(() => { mockStore = createStore(breakPoints['BreakPoint#3']) })
        it ('should set the necessary environment files', () => {
            const state = mockStore.getState()
            fs.emptyDirSync(ENV_PATH)
            Initiator(mockStore)
            expect(mockStore.getState()).toEqual({
                ...state,
                env: {
                    ...state.env,
                    filesPresent: true
                }
            })
            expect(isDirFilesInDir(UNI_ENV_PATH, ENV_PATH)).toBe(true)
            fs.emptyDirSync(ENV_PATH)
        })
    })

    describe ('BreakPoint', () => {
        const testEnvDummyFile = path.join(ENV_PATH, 'dummy.file')
        let mockStore
        beforeAll(() => { mockStore = createStore(breakPoints['BreakPoint#1']) })
        it ('should check if the environment is full', () => {
            const state = mockStore.getState()
            fs.emptyDirSync(ENV_PATH)
            fs.ensureFileSync(testEnvDummyFile)
            Initiator(mockStore)
            expect(mockStore.getState()).toEqual({
                ...state,
                env: {
                    ...state.env,
                    populated: true
                }
            })
            fs.removeSync(testEnvDummyFile)
        })
        it ('should handle refusal to install in a populated environment', () => {
            Initiator(mockStore)
            const errorState = mockStore.getState().error
            const errorMessage = INSTALLATION_DIRECTORY_NOT_EMPTY
            expect(errorState.instance.message)
            .toBe(INSTALLATION_DIRECTORY_NOT_EMPTY)
        })
    })

    describe ('BreakPoint', () => {
        let mockStore
        beforeAll(() => { mockStore = createStore(breakPoints['BreakPoint#2']) })
        it ('should instantiate the environment', () => {
            const prevEnvState = mockStore.getState().env
            fs.copySync(UNI_ENV_PATH, ENV_PATH)
            Initiator(mockStore)
            expect(mockStore.getState().env).toEqual({
                ...prevEnvState,
                initiated: true
            })
            fs.emptyDirSync(ENV_PATH)
        })
        it ('should do nothing', () => {
            const prevState = mockStore.getState()
            Initiator(mockStore)
            expect(mockStore.getState()).toEqual(prevState)
        })
    })

    describe ('BreakPoint', () => {
        let mockStore
        beforeAll(() => { mockStore = createStore(breakPoints['BreakPoint#2']) })
        it ('should handle failure to identify environment package.json file', () => {
            delete require.cache[ENV_PACKAGE_JSON_FILE]
            fs.writeFileSync(ENV_PACKAGE_JSON_FILE, '{}')
            const state = mockStore.getState()
            Initiator(mockStore)
            const errorState = mockStore.getState().error
            expect(errorState.instance.message).toBe(LIKELY_NOT_UNI_ENV)
            fs.removeSync(ENV_PACKAGE_JSON_FILE)
        })
        it ('should handle failure to identify environment package.json file', () => {
            delete require.cache[ENV_PACKAGE_JSON_FILE]
            fs.writeFileSync(ENV_PACKAGE_JSON_FILE, '_')
            const state = mockStore.getState()
            Initiator(mockStore)
            const errorState = mockStore.getState().error
            const errorMessage = UNKNOWN_ENV_PACKAGE_JSON_ERROR
            const suffixIndex = errorMessage.indexOf('Actual Error')
            const suffix = errorMessage.slice(0, suffixIndex - 1).trim()
            expect(errorState.instance.message.startsWith(suffix)).toBe(true)
            fs.removeSync(ENV_PACKAGE_JSON_FILE)
        })
    })

    describe ('BreakPoint', () => {
        let mockStore
        beforeAll(() => { mockStore = createStore(breakPoints['BreakPoint#1']) })
        it ('should handle failures when checking if the environment is empty', () => {
            fs.removeSync(ENV_PATH)
            Initiator(mockStore)
            const errorState = mockStore.getState().error
            const errorMessage = UNKNOWN_ENV_DIRECTORY_ERROR
            const suffixIndex = errorMessage.indexOf('Actual Error')
            const suffix = errorMessage.slice(0, suffixIndex - 1).trim()
            expect(errorState.instance.message.startsWith(suffix)).toBe(true)
            fs.ensureDirSync(ENV_PATH)
        })
    })
})
