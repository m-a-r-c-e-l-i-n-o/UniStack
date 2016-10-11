import { combineReducers } from 'redux'
import graphql from './graphql.js'
import page from './page.js'

export default combineReducers({ page, graphql })
