import React from 'react'
import PageInfo from '../containers/page-info.js'
import { createPage } from 'unistack/unihelpers.js'

const Index = ({ title }) => {
    // Update the page's meta properties. For example, title:
    title(<title>Welcome to the index page!</title>)
    return [PageInfo]
}

export default createPage(Index)
