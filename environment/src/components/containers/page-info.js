import React from 'react'
import { connect } from 'react-redux'
import Text from '../representational/text.js'

const MapStateToProps = ({ pageAssets }, ownProps) => ({
    text: pageAssets.title
})

const PageInfo = connect(MapStateToProps)(Text)

export default PageInfo
