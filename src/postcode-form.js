'use strict'

import Geocoding from './geocoding'

import React, { Component, PropTypes } from 'react'

export default class PostcodeForm extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.geocoding = new Geocoding()
  }

  handleSubmit (e) {
    e.preventDefault()
    const address = this.refs.address.value.trim()

    if (!address) {
      return
    }

    this.geocoding.processAddress(address)
      .then(res => this.props.onPostcodeSubmit(res))
      .catch(err => console.log(err.toString()))

    this.refs.address.value = ''
    return
  }

  render () {
    return (
      <form className='postcode-form' onSubmit={this.handleSubmit}>
        <input type='text' placeholder='Postcode' ref='address' />
        <input type='submit' value='Find' />
      </form>
    )
  }
}

PostcodeForm.propTypes = {
  onPostcodeSubmit: PropTypes.func.isRequired
}
