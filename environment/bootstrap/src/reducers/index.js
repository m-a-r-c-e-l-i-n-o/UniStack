import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import appReducers from 'app/reducers/index.js'

export default combineReducers({
    ...appReducers,
    routing: routerReducer
})
