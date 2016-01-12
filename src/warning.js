'use strict'

import React, { PropTypes } from 'react'

// stateless component
const Warning = (props) => {

  return (
      <div>
          <i className="wi wi-day-lightning"></i>
          <span className='warning'>{props.warning.text}</span>
          <span onClick={() => {props.onWarningClick(props.warning.bounds)}}>{props.warning.type}</span>
      </div>
  )
}

Comment.propTypes = {
  warning: PropTypes.object.isRequired,
    onWarningClick: PropTypes.func
}

export default Warning