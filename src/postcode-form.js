'use strict'

import Geocoding from './geocoding'

import React, { Component, PropTypes } from 'react'


export default class PostcodeForm extends Component {
    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.geocoding = new Geocoding()
    }

    handleSubmit(e) {
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

    render() {
        return (
            <div className="input-group">
                    <input type='text' className="form-control" placeholder='Postcode' ref='address'/>
                     <span className="input-group-btn">
                        <button className="btn btn-default" type="button" onClick={this.handleSubmit}>Find</button>
                     </span>
            </div>
        )
    }
}

PostcodeForm.propTypes = {
    onPostcodeSubmit: PropTypes.func.isRequired
}
