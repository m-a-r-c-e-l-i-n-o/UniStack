import React from 'react'
import { connect } from 'react-redux'

const Index = (dispatch, ownProps) => {

    console.log('dispatch', dispatch)
    // Update the page assets (title, description, css, etc)
    // by dispatching actions targeted at the page assets reducer.

    // Collect graphql schema by dispatching actions targeted at the schema
    // reducer.

    // Do not pass data to containers, this page component is not meant to
    // be data aware, just fire actions to update the state. Your container
    // components should be subscribed to the store and will handle their
    // own data.

    return (
        <div>Hello World!</div>
    )

    // (
        // <div>
            // <ContainerOne>
            // <ContainerTwo>
            // ...
        // <div>
    // )
}

export default connect()(Index)
