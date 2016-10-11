import React from 'react'
import { createWrapper } from 'unistack/unihelpers.js'

const PageNotFound = ({ title }) => {
    title(<title>404!</title>)
    return (
        <div>
            {"...And I still haven't found what I'm looking for..."}
        </div>
    )
}

export default createWrapper(PageNotFound)
