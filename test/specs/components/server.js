// import fs from 'fs-extra'
// import path from 'path'
// import childProcess from 'child_process'
// import Server from '../../../src/components/server.js'
// import createStore from '../../../src/helpers/create-store.js'
// import createLocalState from '../../../src/helpers/create-local-state.js'
// import { isUnknownErrorValid } from '../../../src/helpers/test-facilitator.js'
// import {
//     ENV_NODE_ENTRY_FILE,
//     ENV_NODE_DEV_BUNDLE_FILE,
//     ENV_JSPM_CONFIG_FILE
// } from '../../../src/constants/files.js'
// import {
//     ENV_PATH,
//     UNI_PATH,
//     UNI_ENV_PATH
// } from '../../../src/constants/paths.js'
// import { UNKNOWN_SERVER_ERROR } from '../../../src/constants/language/errors.js'

// const mock = NutraMock.getEntry('src/components/server.js')

// const runSyncJSPMInstall = () => {
//     const jspmBin = path.join(UNI_PATH, 'node_modules', '.bin', 'jspm')
//     childProcess.execSync(`${jspmBin} install`, { cwd: ENV_PATH })
// }

// const buildNodeBundle = (invalidateFile) => {
//     delete global.System
//     delete global.SystemJS
//     const jspm = require('jspm')
//     jspm.setPackagePath(ENV_PATH)
//     const buildOptions = {
//         production: false,
//         minify: false,
//         mangle: false,
//         sourceMaps: true,
//         lowResSourceMaps: false,
//         node: true,
//         conditions: { 'unistack/unistats|platform': 'node' }
//     }
//     const builder = new jspm.Builder(ENV_PATH, ENV_JSPM_CONFIG_FILE)
//     if (invalidateFile) {
//         builder.invalidate(invalidateFile)
//     }
//     return builder.buildStatic(
//         ENV_NODE_ENTRY_FILE,
//         ENV_NODE_DEV_BUNDLE_FILE,
//         buildOptions
//     )
//     .catch(e => console.log('BUNDLE ERROR', e.stack || e))
// }

// if (!process.env.QUICK_TEST_RUN) {
//     describe ('Bundler()', () => {
//         const breakPoints = {}
//         describe ('BreakPoint#1', () => {
//             let mockStore, mockLocalState
//             beforeAll(() => {
//                 const initialState = createStore().getState()
//                 mockStore = createStore({
//                     ...initialState,
//                     server: {
//                         ...initialState.server,
//                         restart: true
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
//             it ('should set the server component dependent initial state', () => {})
//         })

//         describe ('BreakPoint', () => {
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
//                 fs.emptyDirSync(ENV_PATH)
//             })
//             it ('should handle arbitrary server file errors', (done) => {
//                 const prevState = mockStore.getState()
//                 const originalFile = fs.readFileSync(ENV_NODE_ENTRY_FILE, 'utf8')
//                 const erroredFile = 'import "react"; throw new Error("Error!");'
//                 fs.writeFileSync(ENV_NODE_ENTRY_FILE, erroredFile)
//                 buildNodeBundle()
//                 .then(() => {
//                     const promise = Server(mockStore)
//                     expect(mockStore.getState()).toEqual({
//                         ...prevState,
//                         server: {
//                             ...prevState.server,
//                             restart: true,
//                             worthRestartingNow: false
//                         }
//                     })
//                     return promise
//                 })
//                 .then(() => {
//                     fs.writeFileSync(ENV_NODE_ENTRY_FILE, originalFile)
//                     const state = mockStore.getState()
//                     const validError = isUnknownErrorValid(
//                         state.error.instance.message,
//                         UNKNOWN_SERVER_ERROR
//                     )
//                     expect(validError).toBe(true)
//                 })
//                 .then(done)
//                 .catch(e => console.log(e.stack || e))
//             })
//         })

//         describe ('BreakPoint', () => {
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
//                 fs.emptyDirSync(ENV_PATH)
//             })
//             it ('should start the server', (done) => {
//                 const prevState = mockStore.getState()
//                 buildNodeBundle(ENV_NODE_ENTRY_FILE)
//                 .then(() => {
//                     const promise = Server(mockStore)
//                     expect(mockStore.getState()).toEqual({
//                         ...prevState,
//                         server: {
//                             ...prevState.server,
//                             restart: true,
//                             worthRestartingNow: false
//                         }
//                     })
//                     return promise
//                 })
//                 .then(() => {
//                     expect(mockStore.getState()).toEqual({
//                         ...prevState,
//                         server: {
//                             ...prevState.server,
//                             restart: false,
//                             worthRestartingNow: false
//                         }
//                     })
//                     return mockLocalState.get('server').destroy()
//                 })
//                 .then(done)
//                 .catch(e => console.log(e.stack || e))
//             })
//         })
//     })
// }
