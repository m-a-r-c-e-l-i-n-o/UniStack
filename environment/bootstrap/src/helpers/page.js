import React from 'react'
import { connect } from 'react-redux'

export const createPage = component => {
    let children = null
    class Page extends React.Component {
        componentWillMount () {
            children = component(
                this.props.dispatch,
                this.props.params
            )
        }
        render () {
            return children
        }
    }
    return connect()(Page)
}

export { setPageTitle } from '../actions/creators.js'
