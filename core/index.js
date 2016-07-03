import Simple from './simple.js'

console.log(Simple())

/*
var jspm = require('jspm')
jspm.setPackagePath('.')
var builder = new jspm.Builder()
builder.config({ custom: 'options' })
// or builder.buildStatic
builder.bundle('./core/simple.js', {
  minify: true
})
.then(function(output) {
    console.log(output.source)
    // output is now an in-memory build
    // output.source

    // get the depCache configuration for the tree
    var depCache = builder.getDepCache(output.tree)
});
*/
