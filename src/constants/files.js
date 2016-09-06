import path from 'path'
import {
    ENV_PATH,
    ENV_BOOT_PATH,
    UNI_ENV_PATH,
    UNI_ENV_BOOT_PATH,
    ENV_DIST_PATH
} from './paths.js'

export const UNI_ENV_PACKAGE_JSON_FILE = path.join(UNI_ENV_PATH, 'package.json')
export const UNI_ENV_JSPM_CONFIG_FILE = path.join(UNI_ENV_BOOT_PATH, 'jspm.config.js')
export const ENV_PACKAGE_JSON_FILE = path.join(ENV_PATH, 'package.json')
export const ENV_JSPM_CONFIG_FILE = path.join(ENV_BOOT_PATH, 'jspm.config.js')
export const ENV_BROWSER_ENTRY_FILE = path.join(ENV_BOOT_PATH, 'src', 'browser.js')
export const ENV_BROWSER_BUNDLE_FILE = path.join(ENV_DIST_PATH, 'browser.bundle.js')
export const ENV_NODE_ENTRY_FILE = path.join(ENV_BOOT_PATH, 'src', 'node.js')
export const ENV_NODE_DEV_BUNDLE_FILE = path.join(ENV_DIST_PATH, 'node.dev.bundle.js')
export const ENV_NODE_BUNDLE_FILE = path.join(ENV_DIST_PATH, 'node.bundle.js')
