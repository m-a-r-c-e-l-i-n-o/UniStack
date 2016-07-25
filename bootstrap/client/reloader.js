import * as ENV from 'ENV'
import HotReloader from 'systemjs-hot-reloader/hot-reloader.js' // Hot Reloader

let hotReloader = new HotReloader( '//' + ENV.hostName + ':' + ENV.reloaderPort )
  , name

hotReloader.socket.on( 'connect', () => {
    console.log( 'Socket connected!' )
} )

hotReloader.socket.on( 'hello', () => {
    console.log( 'Hey it works!' )
} )

hotReloader.on( 'change', _name => name = _name )

hotReloader.on( 'moduleRecordNotFound', _ => {

    if ( name.endsWith( '.css' ) ) {
        // It's a CSS file, build the new <link> tag.
        let newLink = document.createElement( 'link' )
        newLink.type = 'text/css'
        newLink.rel = 'stylesheet'

        let links = document.getElementsByTagName( 'link' )

        Object.keys( links ).forEach( index => {

            let link = links[ index ]
            // Find the <link> that holds the CSS file, and replace it with the new node.
            // We add a `#` and random value to force a refresh of the CSS.
            let oldHref = link.href;

            if ( oldHref.indexOf( '#' ) != -1 ) {
                oldHref = oldHref.substr( 0, oldHref.indexOf( '#' ) )
            }

            if ( oldHref.endsWith( name ) ) {
                let newHash = Math.round( Math.random() * 1e10 )
                let baseUrl = oldHref.substr( 0, oldHref.indexOf( name ) )
                newLink.href = `${baseUrl}${name}#${newHash}`
                link.parentNode.replaceChild( newLink, link )
            }
        } );
    }
});
