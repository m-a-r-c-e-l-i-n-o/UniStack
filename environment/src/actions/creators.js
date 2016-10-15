import { SET_CLICKS, SET_CLICK_LOADING } from './types.js'

export const getClickCount = (request) => {
    return (dispatch) => {
        return request('{ clicks { count } }').then(({ data, errors }) => {
            if (errors) return console.error(errors)
            const { clicks: { count } } = data
            dispatch({ type: SET_CLICKS, payload: count })
        })
        .catch((e) => { console.log(e.stack) })
    }
}

export const setClickCount = (request) => {
    return (dispatch) => {
        dispatch({ type: SET_CLICK_LOADING })
        return request(`
            mutation {
                setClicks(example: "argument") {
                    count
                }
            }
        `)
        .then(({ data, errors }) => {
            if (errors) return console.error(errors)
            const { setClicks: { count } } = data
            dispatch({ type: SET_CLICKS, payload: count })
        })
        .catch((e) => { console.log(e.stack) })
    }
}
