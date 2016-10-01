import React from 'react'
import PageInfo from '../containers/page-info.js'
import { createPage, setPageTitle } from 'unistack/helpers/page.js'

const About = (dispatch, routeParams) => {
    const title = 'Welcome to the about page!'

    // Update the page assets (title, description, css, etc)
    // by dispatching actions targeted at the page assets reducer.
    // For example:
    dispatch(setPageTitle(title))

    // Page components are not meant to be data aware. It's solely responsible
    // for rendering the appropiate container components, and firing off a fetch
    // action for the aggregated GraphQL queries. More on that soon.

    const containers = (
        <div>
            <PageInfo/>
        </div>
    )
    return containers
}

export default createPage(About)

