import React from 'react'
import { Link } from 'react-router'
import { createWrapper, environment } from 'unistack/unihelpers.js'

// Use this to wrap your route components with other components that is common
// to all pages
const Layout = ({ baseTitle, scripts, children }) => {
    baseTitle(<title>App: %s</title>)

    if (environment === 'production') {
        scripts([
            <script src="/dist/js/hello-world.js"/>,
            <script src="/dist/js/hello-world-2.js"/>
        ])
    }

    return (
        <div>
            <header>
                Links:
                {' '}
                <Link to="/">Home</Link>
                {' '}
                <Link to="/about">About</Link>
                {' '}
                <Link to="/non-existent">Unknown</Link>
            </header>
            {children}
        </div>
    )
}

export default createWrapper(Layout)
