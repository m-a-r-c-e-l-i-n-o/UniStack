import React from 'react'
import Text from '../presentational/text.js'
import { platform } from 'unistack/unihelpers.js'
import { ENABLE_BUTTON, SET_CLICK_LOADING } from '../../actions/types.js'
import { getClickCount, setClickCount } from '../../actions/creators.js'

const PageInfo = ({ state, dispatch, unihelpers }) => {
    const { request, title, initial } = unihelpers
    const { button: { clicks, loading }} = state
    const { children: value } = title()
    const onClick = () => dispatch(setClickCount(request))

    if (initial()) {
        if (platform === 'browser' && loading) {
            dispatch({ type: ENABLE_BUTTON })
        } else if (platform === 'node') {
            dispatch(getClickCount(request)).then(() => (
                dispatch({ type: SET_CLICK_LOADING })
            ))
        }
    }

    return (
        <div>
            <Text value={value}/>
            {' This button '}
            <button onClick={onClick} disabled={loading}>Test GraphQL Run</button>
            {` has been clicked ${clicks} time(s) since this server was put online.`}
        </div>
    )
}

export default PageInfo
