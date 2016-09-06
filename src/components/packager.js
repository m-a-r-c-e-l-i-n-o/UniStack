import fs from 'fs-extra'
import path from 'path'
import createDebugger from 'debug'
import childProcess from 'child_process'
import { handleError } from '../actions/creators.js'
import { ENV_PATH } from '../constants/paths.js'
import {
    ENV_NPM_PACKAGES_PATH,
    ENV_JSPM_PACKAGES_PATH
} from '../constants/paths.js'
import {
    SET_PACKAGER_INSTALLATION_PREPARATION,
    CLEAR_PACKAGER_INSTALLATION_PREPARATION,
} from '../constants/actionTypes.js'
import { UNKNOWN_PACKAGE_INSTALL_ERROR } from '../constants/language/errors.js'

const debug = createDebugger('unistack:packager')

const Packager = ({ getState, dispatch }) => {
    const state = getState()
    const installing = getStateLeaf(state, 'INSTALLING')
    const install = getStateLeaf(state, 'INSTALL')
    if (install && !installing) {
        try {
            debug('Checking if packages are already installed...')
            fs.accessSync(ENV_NPM_PACKAGES_PATH, fs.F_OK)
            fs.accessSync(ENV_JSPM_PACKAGES_PATH, fs.F_OK)
            debug('Yep, their are installed.')
            return dispatch({type: CLEAR_PACKAGER_INSTALLATION_PREPARATION })
        } catch (e) {
            debug('!!!!--Preparing to install packages...')
            dispatch({type: SET_PACKAGER_INSTALLATION_PREPARATION })
        }
        return installPackages()
        .then(() => {
            debug('@@@@--Installed packages')
            return dispatch({type: CLEAR_PACKAGER_INSTALLATION_PREPARATION })
        })
        .catch(error => {
            debug('@@@@--Failed to install packages %s', error.stack)
            return dispatch(makePackageInstallError(error))
        })
    }
}

const getStateLeaf = (state, leaf) => {
    switch(leaf) {
        case 'INSTALL':
            return state.packager.install
        case 'INSTALLING':
            return state.packager.installing
    }
}

const installPackages = () => {
    const jspmExecutable = path.join(ENV_NPM_PACKAGES_PATH, '.bin', 'jspm')
    const command = `npm install && yes | ${jspmExecutable} install`
    const envPath = ENV_PATH
    const options = { cwd: envPath }
    return new Promise((resolve, reject) => {
        debug('Running packages install command: %s', command)
        debug('This will likely take a few minutes...')
        childProcess.exec(command, options, (error, stdout, stderr) => {
            if (error) return reject(error)
            resolve(true)
        })
    })
}

const makePackageInstallError = error => {
    const message = UNKNOWN_PACKAGE_INSTALL_ERROR
    return handleError(error, { message, fatal: true })
}

export default Packager
