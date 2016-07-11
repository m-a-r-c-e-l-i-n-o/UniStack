import React from 'react'
import Layout from 'unistack/server/components/Layout.js'

const CustomLayout = (props) => (
    <Layout initialState={props.initialState}>
        <head>
            <meta charSet="utf-8" />
            <title>{props.title}</title>
            <meta content="width=device-width, initial-scale=1.0" name="viewport" />
            <link rel="stylesheet" href="/css/main.css"/>
        </head>
        <body>
            <div id="unistack">{props.componentHTML}</div>
        </body>
    </Layout>
)

export default CustomLayout
