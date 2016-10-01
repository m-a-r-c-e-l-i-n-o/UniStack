import React from 'react'
const Layout = ({ componentHTML, bodyScripts, title }) => (
    <html>
        <head>
            <meta charSet="utf-8" />
            <title>{title}</title>
            <meta content="width=device-width, initial-scale=1.0" name="viewport" />
            <link rel="stylesheet" href="dist/css/main.css"/>
        </head>
        <body>
            <div id="unistack" dangerouslySetInnerHTML={{ __html: componentHTML }} />
            {( bodyScripts.map(
                (props, i) => <script key={i} {...unescapeReactHTML(props)} />
            ))}
        </body>
    </html>
)

const unescapeReactHTML = ( props ) => {
    if ( ! props.innerHTML ) return props
    return Object.assign({}, {
        ...props,
        innerHTML: null,
        dangerouslySetInnerHTML: { __html: props.innerHTML }
    })
}

export default Layout
