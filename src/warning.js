'use strict'

import React, { PropTypes } from 'react'

// stateless component
const Warning = (props) => {

  return (
    <tr>
      <td className='warning'>{props.warning.text}</td>
      <td onClick={() => {props.onWarningClick(props.warning.bounds)}}>{props.warning.type}</td>
    </tr>
  )
}

Comment.propTypes = {
  warning: PropTypes.object.isRequired,
    onWarningClick: PropTypes.func
}

export default Warning