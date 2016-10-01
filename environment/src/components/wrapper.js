import React from 'react'
import { Link } from 'react-router'

// Use this to wrap your route components with other components that is common
// to all pages
const Wrapper = (props) => {
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
            {props.children}
        </div>
    )
}

export default Wrapper
