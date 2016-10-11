import { platform } from 'unistack/unistats.js'
import {
    graphql,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} from 'graphql'

let clicks = 1
export default (request) => {
    return new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'RootQueryType',
            fields: {
                clicks: {
                    type: GraphQLString,
                    resolve() {
                        return clicks++
                    }
                }
            }
        })
    })
}
