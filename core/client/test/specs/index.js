

describe ('Client', () => {
    it ('should import main client file without errors', (done) => {
        System.import('app')
        .catch(e => console.error(e.originalErr.stack))
        .then(module => {
            done()
        })
    })
})
