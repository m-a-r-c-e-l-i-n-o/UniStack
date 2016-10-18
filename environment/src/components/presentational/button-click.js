import React from 'react'

const ButtonClick = ({ onClick, disabled, clicks }) => (
    <div>
        {' This button '}
        <button onClick={onClick} disabled={disabled}>Test GraphQL Run</button>
        {` has been clicked ${clicks} time(s) since this server was put online.`}
    </div>
)

export default ButtonClick
