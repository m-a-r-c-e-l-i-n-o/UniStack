import React from 'react'

const App = ( props ) =>(
    <div>
        {"This is a global text!"}
        {props.children}
    </div>
)

export default App
