// import _ from 'lodash'
// import fs from 'fs-extra'
// import path from 'path'
// import fileExist from 'file-exists'
// import childProcess from 'child_process'
// import Bundler from '../../../src/components/bundler.js'
// import templatedText from '../../../src/helpers/templated-text.js'
// import { modifiedFile } from '../../../src/helpers/formatted-file.js'
// import createStore from '../../../src/helpers/create-store.js'
// import createLocalState from '../../../src/helpers/create-local-state.js'
// import { isUnknownErrorValid } from '../../../src/helpers/test-facilitator.js'
// import { HANDLE_ERROR } from '../../../src/constants/actionTypes.js'
// import {
//     UNI_PATH,
//     ENV_PATH,
//     UNI_ENV_PATH,
//     ENV_BOOT_PATH
// } from '../../../src/constants/paths.js'
// import {
//     ENV_BROWSER_BUNDLE_FILE,
//     ENV_NODE_DEV_BUNDLE_FILE,
//     ENV_NODE_ENTRY_FILE
// } from '../../../src/constants/files.js'
// import {
//     UNKNOWN_BUNDLE_BUILD_ERROR,
//     UNKNOWN_BUNDLER_INITIALIZATION_ERROR,
//     BUNDLE_BUILD_ERROR
// } from '../../../src/constants/language/errors.js'

// const runSyncJSPMInstall = () => {
//     const jspmBin = path.join(UNI_PATH, 'node_modules', '.bin', 'jspm')
//     childProcess.execSync(`${jspmBin} install`, { cwd: ENV_PATH })
// }

// const mock = NutraMock.getEntry('src/components/bundler.js')

// if (!process.env.QUICK_TEST_RUN) {
//     describe ('Bundler()', () => {
//         const breakPoints = {}
//         describe ('BreakPoint#1', () => {
//             let mockStore, mockLocalState
//             beforeAll(() => {
//                 const initialState = createStore().getState()
//                 mockStore = createStore({
//                     ...initialState,
//                     bundle: {
//                         ...initialState.bundle,
//                         bundle: true
//                     }
//                 })
//                 const initialLocalState = mock.get('localState').get()
//                 mockLocalState = createLocalState(initialLocalState)
//                 mock.set('localState', mockLocalState)
//             })
//             afterAll(() => {
//                 mock.reset('localState')
//                 breakPoints['BreakPoint#1'] = {
//                     global: mockStore.getState(),
//                     local: mockLocalState.get()
//                 }
//             })
//             it ('should set the dependent initial state', () => {})
//         })

//         describe ('BreakPoint#2', () => {
//             let mockStore, mockLocalState
//             const defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
//             beforeAll(() => {
//                 jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000 // 5 minutes
//                 mockStore = createStore(breakPoints['BreakPoint#1'].global)
//                 mockLocalState = createLocalState(breakPoints['BreakPoint#1'].local)
//                 mock.set('localState', mockLocalState)
//                 fs.copySync(UNI_ENV_PATH, ENV_PATH)
//                 runSyncJSPMInstall()
//             })
//             afterAll(() => {
//                 jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout
//                 mock.reset('localState')
//                 breakPoints['BreakPoint#2'] = {
//                     global: mockStore.getState(),
//                     local: mockLocalState.get()
//                 }
//                 fs.emptyDirSync(ENV_PATH)
//             })
//             it ('should initialize the local state', () => {
//                 Bundler(mockStore)
//                 expect(mockLocalState.get('initialized')).toBe(true)
//             })
//             it ('should handle arbitrary bundle errors', (done) => {
//                 mock.set('ENV_BROWSER_ENTRY_FILE', 'path/to/no/file.js')
//                 const prevState = mockStore.getState()
//                 Bundler(mockStore)
//                 .then(() => {
//                     mock.reset('ENV_BROWSER_ENTRY_FILE')
//                     const state = mockStore.getState()
//                     const validError = isUnknownErrorValid(
//                         state.error.instance.message,
//                         UNKNOWN_BUNDLE_BUILD_ERROR
//                     )
//                     expect(validError).toBe(true)
//                     done()
//                 })
//                 .catch(e => console.log(e || e.stack))
//             })
//             it ('should initialize the bundles', (done) => {
//                 const prevState = mockStore.getState()
//                 Bundler(mockStore).then(() => {
//                     expect(fileExist(ENV_BROWSER_BUNDLE_FILE)).toBe(true)
//                     expect(fileExist(ENV_NODE_DEV_BUNDLE_FILE)).toBe(true)
//                     expect(mockStore.getState()).toEqual({
//                         ...prevState,
//                         bundle: {
//                             ...prevState.bundle,
//                             updating: false,
//                             bundlesInitialized: true
//                         },
//                         broadcaster: {
//                             ...prevState.broadcaster,
//                             listen: true
//                         }
//                     })
//                     done()
//                 }).catch(e => console.log(e.stack))
//                 expect(mockStore.getState()).toEqual({
//                     ...prevState,
//                     bundle: {
//                         ...prevState.bundle,
//                         updating: true,
//                         bundlesInitialized: null
//                     }
//                 })
//             })
//         })

//         describe ('BreakPoint#3', () => {
//             let mockStore, mockLocalState
//             beforeAll(() => {
//                 const initialStoreState = breakPoints['BreakPoint#2'].global
//                 const mockNodeFile = path.join(ENV_BOOT_PATH, 'src', 'routes.js')
//                 const mockStateWithModifiedFiles = {
//                     ...initialStoreState,
//                     bundle: {
//                         ...initialStoreState.bundle,
//                         newlyModifiedFile: true
//                     },
//                     env: {
//                         ...initialStoreState.env,
//                         modifiedFile: modifiedFile(mockNodeFile, 'changed')
//                     }
//                 }
//                 mockStore = createStore(mockStateWithModifiedFiles)
//                 mockLocalState = createLocalState(breakPoints['BreakPoint#2'].local)
//                 mock.set('localState', mockLocalState)
//             })
//             afterAll(() => {
//                 mock.reset('localState')
//                 breakPoints['BreakPoint#3'] = {
//                     global: mockStore.getState(),
//                     local: mockLocalState.get()
//                 }
//             })
//             it ('should emulate condition where a isomorphic file has been modified', () => {})
//         })

//         describe ('BreakPoint#5', () => {
//             let mockStore, mockLocalState
//             beforeAll(() => {
//                 mockStore = createStore(breakPoints['BreakPoint#3'].global)
//                 mockLocalState = createLocalState(breakPoints['BreakPoint#3'].local)
//                 mock.set('localState', mockLocalState)
//                 fs.copySync(UNI_ENV_PATH, ENV_PATH)
//                 runSyncJSPMInstall()
//             })
//             afterAll(() => {
//                 mock.reset('localState')
//                 breakPoints['BreakPoint#5'] = {
//                     global: mockStore.getState(),
//                     local: mockLocalState.get()
//                 }
//                 fs.emptyDirSync(ENV_PATH)
//             })
//             it ('should invalidate bundle file', () => {
//                 const prevState = mockStore.getState()
//                 Bundler(mockStore)
//                 const state = mockStore.getState()
//                 expect(mockStore.getState()).toEqual({
//                     ...prevState,
//                     bundle: {
//                         ...prevState.bundle,
//                         newlyModifiedFile: false,
//                         pending: true
//                     }
//                 })
//             })
//             it ('should clear a pending bundle file', () => {
//                 const prevState = mockStore.getState()
//                 Bundler(mockStore)
//                 expect(mockStore.getState()).toEqual({
//                     ...prevState,
//                     bundle: {
//                         ...prevState.bundle,
//                         filesInvalidated: true,
//                         pending: false
//                     }
//                 })
//             })
//             it ('should handle invalid bundle file errors', (done) => {
//                 const prevState = mockStore.getState()
//                 const invalidatedFile = prevState.env.modifiedFile.name
//                 const originalContent = fs.readFileSync(invalidatedFile, 'utf8')
//                 fs.writeFileSync(invalidatedFile, 'import "nothing"')
//                 Bundler(mockStore).then(() => {
//                     fs.writeFileSync(invalidatedFile, originalContent)
//                     const state = mockStore.getState()
//                     const message = templatedText(BUNDLE_BUILD_ERROR, {
//                         'FILENAME': invalidatedFile,
//                         'ERROR': '{{ERROR}}'
//                     })
//                     const validError = isUnknownErrorValid(
//                         state.error.instance.message,
//                         message
//                     )
//                     expect(validError).toBe(true)
//                     expect(mockStore.getState()).toEqual({
//                         ...prevState,
//                         bundle: {
//                             ...prevState.bundle,
//                             invalidFile: invalidatedFile,
//                             updating: false
//                         },
//                         error: {
//                             ...state.error
//                         }
//                     })
//                     done()
//                 })
//                 .catch(e => console.log(e.stack || e))
//             })
//         })

//         describe ('BreakPoint', () => {
//             let mockStore, mockLocalState
//             const defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
//             beforeAll(() => {
//                 jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000 // 5 minutes
//                 mockStore = createStore({
//                     ...breakPoints['BreakPoint#5'].global,
//                     bundle: {
//                         ...breakPoints['BreakPoint#5'].global.bundle,
//                         newlyModifiedFile: true
//                     }
//                 })
//                 mockLocalState = createLocalState(breakPoints['BreakPoint#5'].local)
//                 mock.set('localState', mockLocalState)
//                 fs.copySync(UNI_ENV_PATH, ENV_PATH)
//                 runSyncJSPMInstall()
//             })
//             afterAll(() => {
//                 jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout
//                 mock.reset('localState')
//                 fs.emptyDirSync(ENV_PATH)
//             })
//             it ('should restore an invalid file', () => {
//                 const prevState = mockStore.getState()
//                 Bundler(mockStore)
//                 expect(mockStore.getState()).toEqual({
//                     ...prevState,
//                     bundle: {
//                         ...prevState.bundle,
//                         invalidFile: false,
//                         newlyModifiedFile: false,
//                         pending: true
//                     }
//                 })
//             })
//             it ('should reclear a pending bundle file', () => {
//                 const prevState = mockStore.getState()
//                 Bundler(mockStore)
//                 expect(mockStore.getState()).toEqual({
//                     ...prevState,
//                     bundle: {
//                         ...prevState.bundle,
//                         filesInvalidated: true,
//                         pending: false
//                     }
//                 })
//             })
//             it ('should rebundle', (done) => {
//                 const prevState = mockStore.getState()
//                 Bundler(mockStore)
//                 .then(() => {
//                     expect(mockStore.getState()).toEqual({
//                         ...prevState,
//                         bundle: {
//                             ...prevState.bundle,
//                             updating: false,
//                             filesInvalidated: false
//                         }
//                     })
//                     done()
//                 })
//                 .catch(e => console.log(e.stack))
//                 expect(mockStore.getState()).toEqual({
//                     ...prevState,
//                     bundle: {
//                         ...prevState.bundle,
//                         updating: true
//                     }
//                 })
//             })
//             it ('should do nothing', () => {
//                 const prevState = mockStore.getState()
//                 Bundler(mockStore)
//                 expect(mockStore.getState()).toEqual(prevState)
//             })
//         })

//         describe ('BreakPoint', () => {
//             let mockStore, mockLocalState
//             beforeAll(() => {
//                 const initialStoreState = breakPoints['BreakPoint#2'].global
//                 const mockNodeFile = path.join(ENV_BOOT_PATH, 'src', 'node.js')
//                 const mockStateWithModifiedFiles = {
//                     ...initialStoreState,
//                     bundle: {
//                         ...initialStoreState.bundle,
//                         newlyModifiedFile: true
//                     },
//                     env: {
//                         ...initialStoreState.env,
//                         modifiedFile: modifiedFile(mockNodeFile, 'changed')
//                     }
//                 }
//                 mockStore = createStore(mockStateWithModifiedFiles)
//                 mockLocalState = createLocalState(breakPoints['BreakPoint#2'].local)
//                 mock.set('localState', mockLocalState)
//                 fs.copySync(UNI_ENV_PATH, ENV_PATH)
//                 runSyncJSPMInstall()
//             })
//             afterAll(() => {
//                 mock.reset('localState')
//                 fs.emptyDirSync(ENV_PATH)
//             })
//             it ('should identify the invalidation of a node only file', () => {
//                 const prevState = mockStore.getState()
//                 Bundler(mockStore)
//                 expect(mockStore.getState()).toEqual({
//                     ...prevState,
//                     bundle: {
//                         ...prevState.bundle,
//                         newlyModifiedFile: false,
//                         pending: true
//                     },
//                     env: {
//                         ...prevState.env,
//                         nodeOnlyFileChange: true
//                     },
//                     server: {
//                         ...prevState.server,
//                         restart: true
//                     }
//                 })
//             })
//         })

//         describe ('BreakPoint', () => {
//             let mockStore
//             beforeAll(() => {
//                 mockStore = createStore(breakPoints['BreakPoint#1'].global)
//             })
//             it ('should handle errors when initializing bundlers', () => {
//                 mock.set('nodeBundler', null)
//                 Bundler(mockStore)
//                 mock.reset('nodeBundler')
//                 const validError = isUnknownErrorValid(
//                     mockStore.getState().error.instance.message,
//                     UNKNOWN_BUNDLER_INITIALIZATION_ERROR
//                 )
//                 expect(validError).toBe(true)
//             })
//         })

//         describe ('BreakPoint', () => {
//             it ('should do nothing', () => {
//                 const mockStore = createStore()
//                 const state = mockStore.getState()
//                 Bundler(mockStore)
//                 expect(state).toEqual(mockStore.getState())
//             })
//         })
//     })
// }
