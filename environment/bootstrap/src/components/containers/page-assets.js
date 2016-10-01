import React from 'react'
import { connect } from 'react-redux'
import DOMRebel from '../representational/dom-rebel.js'

const MapStateToProps = ({ pageAssets }, ownProps) => {
    return {
        title: pageAssets.title,
        bodyScripts: pageAssets.bodyScripts,
    }
}

const PageAssets = connect(MapStateToProps)(DOMRebel)

export default PageAssets
