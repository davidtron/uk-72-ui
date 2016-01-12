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
        return <div>No warnings for this area</div>
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