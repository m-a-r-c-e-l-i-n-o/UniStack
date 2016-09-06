import path from 'path'
import { UNI_PATH, ENV_PATH } from '../../src/constants/paths.js'

if (UNI_PATH !== path.join(__dirname, '..', '..') ||
    ENV_PATH !== path.join(UNI_PATH, 'test', 'environment')) {
    throw new Error('Ensure roots are correct, it can really screw things up!')
}
