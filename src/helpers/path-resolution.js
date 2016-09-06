import path from 'path'

const uniPath = path.join(__dirname, '..', '..')

const getEnvironmentPath = () => {
    if (process.cwd() === uniPath) {
        return path.join(uniPath, 'test', 'environment')
    } else {
        return process.cwd()
    }
}

export {
    getEnvironmentPath
}
