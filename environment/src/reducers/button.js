import { SET_CLICK_LOADING, SET_CLICKS } from '../actions/types.js'

const initialState = { clicks: 0, loading: false }

const button = (button = initialState, { type, payload }) => {
    switch (type) {
        case SET_CLICKS:
            return { ...button, clicks: payload, loading: false }
        case SET_CLICK_LOADING:
            return { ...button, loading: true }
        default:
            return button
    }
}

export default button
