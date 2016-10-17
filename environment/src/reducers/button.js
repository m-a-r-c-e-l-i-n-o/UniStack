import { SET_CLICK_LOADING, SET_CLICKS, ENABLE_BUTTON } from '../actions/types.js'

const initialState = { clicks: 0, loading: true }

const button = (button = initialState, { type, payload }) => {
    switch (type) {
        case SET_CLICKS:
            return { ...button, clicks: payload, loading: false }
        case ENABLE_BUTTON:
            return { ...button, loading: false }
        case SET_CLICK_LOADING:
            return { ...button, loading: true }
        default:
            return button
    }
}

export default button
