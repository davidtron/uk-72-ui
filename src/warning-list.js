'use strict'

import React, { PropTypes } from 'react'
import Warning from './warning'

// stateless component
const WarningList = (props) => {
  const warnings = props.warnings.map((warning, i) => {
    return (
      <Warning warning={warning} key={i} onWarningClick={props.onWarningClick}>
      </Warning>
    )
  })

    if(!props.warnings || props.warnings.length === 0) {
        return <div className='no-warnings'>
            <h3>No warnings for this area</h3>
            <p>Move the map to see any flood and weather warnings in the UK</p>
            <p>Type a postcode to check for power outages</p>
        </div>
    } else {
        return (
            <div>{warnings}</div>
        )
    }

}

WarningList.propTypes = {
  warnings: PropTypes.array.isRequired,
    onWarningClick: PropTypes.func
}

export default WarningList