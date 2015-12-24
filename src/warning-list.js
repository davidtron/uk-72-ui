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

  return (
    <table>
      <thead>
      <tr>
        <th>blah</th>
        <th>blah</th>
      </tr>
      </thead>
      <tbody>{warnings}</tbody>
    </table>
  )
}

WarningList.propTypes = {
  warnings: PropTypes.array.isRequired,
    onWarningClick: PropTypes.func
}

export default WarningList