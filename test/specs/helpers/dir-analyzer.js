import fs from 'fs-extra'
import path from 'path'
import {
    UNI_TEST_PATH,
    UNI_TEMP_TEST_PATH
} from '../../../src/constants/paths.js'
import { walkDirSync, isDirFilesInDir } from '../../../src/helpers/dir-analyzer.js'

describe ('walkDirSync()', () => {
    it ('should return recursively return all files in a directory', () => {
        const deepDir = path.join(UNI_TEMP_TEST_PATH, 'deep')
        fs.ensureDirSync(deepDir)
        fs.ensureFileSync(path.join(UNI_TEMP_TEST_PATH, 'dummy.file'))
        fs.ensureFileSync(path.join(deepDir, 'dummy.file'))
        expect(walkDirSync(UNI_TEMP_TEST_PATH)).toEqual([
            '/deep/dummy.file',
            'dummy.file'
        ])
        fs.removeSync(UNI_TEMP_TEST_PATH)
    })
    it ('should throw error when directory does not exist', () => {
        expect(() => walkDirSync('path/to/no/where')).toThrowError()
    })
})

describe ('isDirFilesInDir()', () => {
    let baseDirs
    beforeAll(() => {
        baseDirs = [
            path.join(UNI_TEMP_TEST_PATH, 'aDir'),
            path.join(UNI_TEMP_TEST_PATH, 'bDir')
        ]
        baseDirs.forEach(dir => {
            const deepDir = path.join(dir, 'deep')
            fs.ensureDirSync(deepDir)
            fs.ensureFileSync(path.join(dir, 'dummy.file'))
            fs.ensureFileSync(path.join(deepDir, 'dummy.file'))
        })
    })
    afterAll(() => { fs.removeSync(UNI_TEMP_TEST_PATH) })
    it ('should return true', () => {
        expect(isDirFilesInDir(baseDirs[0], baseDirs[1])).toEqual(true)
        // add an extra file to second directory
        fs.ensureFileSync(path.join(baseDirs[1], 'dummy2.file'))
        expect(isDirFilesInDir(baseDirs[0], baseDirs[1])).toEqual(true)
    })
    it ('should return false', () => {
        // remove necessary file from second directory
        fs.removeSync(path.join(baseDirs[1], 'dummy.file'))
        expect(isDirFilesInDir(baseDirs[0], baseDirs[1])).toEqual(false)
    })
})
