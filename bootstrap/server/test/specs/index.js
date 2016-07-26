import Index from '../../index.js'

describe ('Index', () => {
    it ('should import main client file without errors', (done) => {
        console.log('Hello from spec!')
        Index.serve.then(server => server.close(done))
    })
})
