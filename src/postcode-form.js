'use strict'

import Geocoding from './geocoding'

import React, { Component, PropTypes } from 'react'

export default class PostcodeForm extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (e) {
    e.preventDefault()
    const address = this.refs.address.value.trim()

    if (!address) {
      return
    }

    let geocoding = new Geocoding()
    geocoding.processAddress(address)
      .then(res => console.log('processed address to',res))
      .catch(err => console.log(err.toString()))

    // First use a google geocoder to try and convert the address into a postcode and coords
    // If geocoder does not have a postcode we take the coords google gave us and pass them into

    //this.props.onPostcodeSubmit({ postcode: postcode })
    //this.refs.address.value = ''
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
