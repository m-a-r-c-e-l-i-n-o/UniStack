import { SET_CLICKS, SET_CLICK_LOADING } from './types.js'

export const getClickCount = (request) => {
    return (dispatch) => {
        dispatch({ type: SET_CLICK_LOADING })
        return request('{ clicks }')
        .then(response => {
            const { data: { clicks, errors } } = response
            if (errors) return console.error(errors)
            dispatch({ type: SET_CLICKS, payload: clicks })
        })
        .catch((e) => { console.log(e.stack) })
    }
}
