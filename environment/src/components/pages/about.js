import React from 'react'
import PageInfo from '../containers/page-info.js'
import { createPage } from 'unistack/unihelpers.js'

const About = ({ title }) => {
    title(<title>Welcome to the about page!</title>)
    return [PageInfo]
}

export default createPage(About)
