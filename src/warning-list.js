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
        return <div>
            <h3>No warnings for this area</h3>
            <p>Use the map to see floods and weather warnings for the UK</p>
            <p>Use the search option to find power outages for a postcode</p>
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