import React from 'react'
import { connect } from 'react-redux'
import { platform } from '../uni.js'

class PageManager extends React.Component {
    constructor(props) {
        super(props)
        this.state = { rendering: false, pending: false }
    }
    render () {
        const { containers, state, dispatch, unihelpers } = this.props
        if (this.state.rendering) {
            this.state.pending = true
        } else {
            this.state.rendering = true
            const components = (
                <div>
                    {[].concat(containers).map((Container, key) => (
                        { ...Container({ state, dispatch, unihelpers }), key }
                    ))}
                </div>
            )
            this.state.rendering = false
            if (this.state.pending) {
                this.state.pending = false
                return this.render()
            }
            if (platform === 'browser') {
                unihelpers.request()
            }
            return components
        }
    }
}

const mapStateToProps = (state, ownProps) => ({ state, ...ownProps })

export default connect(mapStateToProps)(PageManager)
