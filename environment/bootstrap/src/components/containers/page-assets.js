import React from 'react'
import { connect as Connect } from 'react-redux'
import DOMRebel from '../representational/dom-rebel.js'

const MapStateToProps = ({ pageAssets }, ownProps) => {
    console.log('pageAssets', pageAssets)
    return {
        title: pageAssets.title,
        bodyScripts: pageAssets.bodyScripts,
    }
}

const PageAssets = Connect(MapStateToProps)(DOMRebel)

export default PageAssets
