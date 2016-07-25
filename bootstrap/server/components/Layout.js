import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server.js';

function unescapeHTML( props ) {
    if ( ! props.children ) return props
    return Object.assign( {}, {
        ...props,
        children: null,
        dangerouslySetInnerHTML: { __html: props.children }
    } );
}

const Layout = ( props ) => {
    let layout = {};
    props.children.forEach(
        child => layout[ child.type || 'children' ] = child
    )
    return (
        <html>
            <head>
                { ( layout.head ?
                    ( Array.isArray( layout.head.props.children ) ?
                        layout.head.props.children.map( ( tag, i ) => {
                            return <tag.type key={i} {...unescapeHTML(tag.props)} />
                        }
                        ) :
                        <layout.head.props.children.type
                            key={1}
                            {...unescapeHTML(layout.head.props.children.props)}
                        />
                    ) : null
                ) }
                { ( process.env.NODE_ENV === 'development' ?
                    <script src="/node_modules/unistack/bootstrap/jspm_packages/system.src.js" />
                    : null
                ) }
                { ( process.env.NODE_ENV === 'development' ?
                    <script src="/node_modules/unistack/bootstrap/jspm.config.js" />
                    : null
                ) }
            </head>
            <body>
                { ( layout.body ?
                    ( Array.isArray( layout.body.props.children ) ?
                        layout.body.props.children.map( ( tag, i ) =>
                            <tag.type key={i} {...unescapeHTML(tag.props)} />
                        ) :
                        <layout.body.props.children.type
                            key={1}
                            {...unescapeHTML(layout.body.props.children.props)}
                        />
                    ) : null
                ) }
                { ( props.initialState ?
                    <script
                        dangerouslySetInnerHTML={
                            {
                                __html:
                                    'window.__INITIAL_STATE__ = ' +
                                    JSON.stringify( props.initialState )
                            }
                        }
                    />
                    : null
                ) }
                { ( process.env.NODE_ENV === 'development' ?
                    <script src="/dist/client.bundle.js" /> :
                    <script src="/js/bundle.js" />
                ) }
                { ( process.env.NODE_ENV === 'development' ?
                    <script
                        dangerouslySetInnerHTML={
                            {
                                __html: 'System.trace = true; System.import("node_modules/unistack/bootstrap/client/index.js")'
                            }
                        }
                    />
                    : null
                ) }
            </body>
        </html>
    )
}

export default Layout
