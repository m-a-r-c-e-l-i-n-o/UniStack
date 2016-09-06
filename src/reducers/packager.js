import {
    TOGGLE_ENV_INITIATED_FLAG,
    SET_PACKAGER_INSTALLATION_PREPARATION,
    CLEAR_PACKAGER_INSTALLATION_PREPARATION
} from '../constants/actionTypes.js'

const initialState = {
    install: false,
    installing: false
}

const packager = (packager = initialState, { type, payload }) => {
    switch (type) {
        case TOGGLE_ENV_INITIATED_FLAG:
            return {
                ...packager,
                install: true
            }
        case SET_PACKAGER_INSTALLATION_PREPARATION:
            return {
                ...packager,
                installing: true
            }
        case CLEAR_PACKAGER_INSTALLATION_PREPARATION:
            return {
                ...packager,
                install: false,
                installing: false
            }
        default:
            return packager
    }
}

export default packager
