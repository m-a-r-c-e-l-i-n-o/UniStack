import _ from 'lodash'
import fs from 'fs'
import path from 'path'

const walkDirSync = (dir, filelist, baseDir) => {
    const files = fs.readdirSync(dir)
    filelist = filelist || []
    baseDir = baseDir || dir
    files.forEach(file => {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
            filelist = walkDirSync(dir + '/' + file, filelist, baseDir)
        } else {
            filelist.push(path.join(dir.replace(baseDir, ''), file))
        }
    })
    return filelist
}

const isDirFilesInDir = (aDir, bDir) => {
    const aFiles = walkDirSync(aDir)
    const bFiles = walkDirSync(bDir)
    return (_.intersection(aFiles, bFiles).length === aFiles.length)
}

export { walkDirSync, isDirFilesInDir }
