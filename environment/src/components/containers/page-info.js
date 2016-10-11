import React from 'react'
import Button from '../presentational/button.js'
import Text from '../presentational/text.js'
import { platform } from 'unistack/unistats.js'
import { getClickCount } from '../../actions/creators.js'

const PageInfo = ({ state, dispatch, unihelpers }) => {
    const { request, title } = unihelpers
    const { button: { clicks, updating }} = state
    const { children: value } = title()
    const onClick = () => dispatch(getClickCount(request))
    // if (platform === 'node') onClick()
    return (
        <div>
            <Text value={value}/>
            {' This button '}
            <Button onClick={onClick} disabled={updating}>Test GraphQL Run</Button>
            {` has been clicked ${clicks} time(s) since this server was put online.`}
        </div>
    )
}

export default PageInfo
