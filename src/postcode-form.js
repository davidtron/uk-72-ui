'use strict'

import React, { Component, PropTypes } from 'react'

export default class PostcodeForm extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (e) {
    e.preventDefault()
    const postcode = this.refs.postcode.value.trim()

    if (!postcode) {
      return
    }

    this.props.onPostcodeSubmit({ postcode: postcode })
    this.refs.postcode.value = ''
    return
  }

  render () {
    return (
      <form className='postcode-form' onSubmit={this.handleSubmit}>
        <input type='text' placeholder='Postcode' ref='postcode' />
        <input type='submit' value='Post' />
      </form>
    )
  }
}

PostcodeForm.propTypes = {
  onPostcodeSubmit: PropTypes.func.isRequired
}
