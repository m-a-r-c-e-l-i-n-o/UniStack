import path from 'path'
import { getEnvironmentPath } from '../../../src/helpers/path-resolution.js'

const mock = NutraMock.getEntry('src/helpers/path-resolution.js')

describe ('getEnvironmentPath()', () => {
    const uniPath = path.join(__dirname, '..', '..', '..')
    it ('should return the test environment path when running tests', () => {
        const uniTestEnvPath = path.join(uniPath, 'test', 'environment')
        expect(getEnvironmentPath()).toBe(uniTestEnvPath)
    })
    it ('should return the current working directory', () => {
        const randomDirectory = 'ideally/the/installation/directory'
        mock.set('uniPath', randomDirectory)
        expect(getEnvironmentPath()).toBe(uniPath)
        mock.reset('uniPath')
    })
})
