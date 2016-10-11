import React from 'react'
import { unescapeReactHTML } from 'unistack/unihelpers.js'

const Layout = ({ unistack, scripts, styles, title }) => (
    <html>
        <head>
            <meta charset="utf-8"/>
            <meta http-equiv="x-ua-compatible" content="ie=edge"/>
            {title}
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            {styles}
        </head>
        <body>
            {unistack}
            {scripts}
        </body>
    </html>
)

export default Layout
