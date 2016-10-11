import React from 'react'
import ReactDOM from 'react-dom'
import GraphiQL from 'graphiql'

const graphQLFetcher = (graphQLParams) => {
    console.log('Fetching GraphQL!')
    // return fetch(window.location.origin + '/graphql', {
    //     method: 'post',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(graphQLParams)
    // })
    // .then(response => response.json())
}

ReactDOM.render(
    <GraphiQL fetcher={graphQLFetcher}/>,
    document.getElementById('unistack')
)
