import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';
import reducers from '../reducers/index.js'

const storeCreator = (initialState) => {
    return applyMiddleware(thunk)(createStore)(reducers, initialState)
}

export default storeCreator
