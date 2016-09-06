import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import pageAssets from './page-assets.js'

const envReducers = {}
const reducers = Object.assign({}, envReducers, {
    pageAssets,
    routing: routerReducer
})

export default combineReducers(reducers)
