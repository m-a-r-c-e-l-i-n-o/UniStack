import React from 'react'
import { connect } from 'react-redux'
import storeShape from 'react-redux/lib/utils/storeShape'
import PageManager from './page-manager.js'

const Page = (component, options = {}) => {
    class PageInstance extends React.Component {
        constructor(props) {
            super(props)
            this.state = { children: [] }
        }
        generateProps() {
            const { params, history, children } = this.props
            const { unihelpers } = this.context.store
            return { ...unihelpers, params, history, children }
        }
        render () {
            const unihelpers = this.generateProps()
            const containers = component(unihelpers)
            if (options.wrapper) return containers
            const props = { unihelpers, containers }
            return <PageManager {...props} />
        }
    }
    PageInstance.contextTypes = { store: storeShape }
    PageInstance.Component = component
    return PageInstance
}

export default Page
