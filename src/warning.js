'use strict'

import React, { Component, PropTypes } from 'react'

export default class Warning extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showDetails: false
        }

        this.showDetail = this.showDetail.bind(this)
    }


    showDetail() {
        const toggle = this.state.showDetails
        this.setState( {showDetails: !toggle})
    }

    render() {
        // Overall class name of row
        const warningMap = {
            'green': 'wp',
            'yellow': 'wp alert-info',
            'amber': 'wp alert-warning',
            'red': 'wp alert-danger'
        }

        // TODO - work out how to map the time component of a warning into icon
        const timeMap = {}

        // TODO - work out how to map warning type to correct icon or background image
        const warningTypeMap = {}

        // Map the warning type and severity to correct image/icon combo
        let warning = this.props.warning

        const warningDetail =
            <div className="warning-details" >
                <div>
                    {warning.detail}
                </div>
                <div>
                    From <i className="wi wi-time-12">12</i> to <i className="wi wi-time-3">15</i>
                    <a className="more" href="#">National Power</a>
                </div>
            </div>


        return (
            <div className={warningMap[warning.warningLevel]} onClick={() => {this.props.onWarningClick(warning.bounds)}}>
                <div className="warning-row">
                    <div className='warning-triangle'>
                        <i className="wi wi-day-lightning"></i>
                    </div>
                    <div className="warning-stuff">
                        <span>{warning.type} {warning.text}</span><br />
                        <a className="more" href="#" onClick={this.showDetail}> { this.state.showDetails ? 'less' : 'more' }</a>
                    </div>

                </div>
                { this.state.showDetails ? warningDetail : null }
            </div>
        )
    }
}

Comment.propTypes = {
    warning: PropTypes.object.isRequired,
    onWarningClick: PropTypes.func
}