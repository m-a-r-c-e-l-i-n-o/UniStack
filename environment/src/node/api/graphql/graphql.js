import { platform } from 'unistack/unihelpers.js'
import {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} from 'graphql'

let clickCountStore = 0
const Clicks = new GraphQLObjectType({
    name: 'Clicks',
    fields: {
        count: {
            type: GraphQLString,
            resolve(count) {
                return count
            }
        }
    }
})

const query = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        clicks: {
            type: Clicks,
            resolve() {
                return clickCountStore
            }
        }
    }
})

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        setClicks: {
            type: Clicks,
            args: {
                example: {
                    type: GraphQLString
                }
            },
            resolve(_, { example }) {
                return ++clickCountStore
            }
        }
    }
})

export default (request) => new GraphQLSchema({ query, mutation })
