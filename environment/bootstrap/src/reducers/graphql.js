import {
    SET_GRAPH_QL_REQUEST,
    SET_GRAPH_QL_PROMISE,
    CLEAR_GRAPHQL_STATE
} from '../actions/types.js'

const initialState = {
    requests: [],
    promises: []
}

const graphql = (graphql = initialState, { type, payload }) => {
    switch (type) {
        case CLEAR_GRAPHQL_STATE:
            return {
                ...graphql,
                requests: [],
                promises: []
            }
        case SET_GRAPH_QL_REQUEST:
            return {
                ...graphql,
                requests: [
                    ...graphql.requests,
                    payload
                ]
            }
        case SET_GRAPH_QL_PROMISE:
            return {
                ...graphql,
                promises: [
                    ...graphql.promises,
                    payload
                ]
            }
        default:
            return graphql
    }
}

export default graphql
