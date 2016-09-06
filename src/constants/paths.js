import Path from 'path'
import { environment } from '../config.js'

const UNI_PATH = Path.join(__dirname, '..', '..')
const UNI_TEMP_PATH = Path.join(UNI_PATH, 'temp')
const UNI_TEST_PATH = Path.join(UNI_PATH, 'test')
const UNI_TEMP_TEST_PATH = Path.join(UNI_TEMP_PATH, 'test')
const UNI_ENV_PATH = Path.join(UNI_PATH, 'environment')
const UNI_ENV_BOOT_PATH = Path.join(UNI_ENV_PATH, 'bootstrap')
const ENV_PATH = environment.path
const ENV_DIST_PATH = Path.join(ENV_PATH, 'dist')
const ENV_BOOT_PATH = Path.join(ENV_PATH, 'bootstrap')
const ENV_JSPM_PACKAGES_PATH = Path.join(ENV_BOOT_PATH, 'jspm_packages')
const ENV_NPM_PACKAGES_PATH = Path.join(ENV_PATH, 'node_modules')

export {
    UNI_PATH,
    UNI_TEMP_PATH,
    UNI_TEST_PATH,
    UNI_TEMP_TEST_PATH,
    UNI_ENV_PATH,
    UNI_ENV_BOOT_PATH,
    ENV_PATH,
    ENV_BOOT_PATH,
    ENV_NPM_PACKAGES_PATH,
    ENV_JSPM_PACKAGES_PATH,
    ENV_DIST_PATH
}
