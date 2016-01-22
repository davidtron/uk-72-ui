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

    generateTimeFragment(label, time) {
        if(!time) return null

        const date = new Date(time)
        // if the date is today just return the time part
        const now = new Date()

        function pad(n) {
            return (n < 10) ? ("0" + n) : n
        }

        let timeString = null
        if(date.getDay() === now.getDay() && date.getMonth() === now.getMonth() && date.getYear() === now.getYear()) {
            const in12 = date.getHours() % 12
            const iconForTime = 'wi wi-time-' + (in12 === 0 ? 12 : in12)

            timeString = <i className={iconForTime}>{pad(date.getHours()) +':' + pad(date.getMinutes())}</i>
        } else {
            timeString = date.toLocaleDateString()
        }

        return <span>{label} {timeString}</span>
    }

    generateWarningIcon(warning) {

        // Power cuts
        if(warning.type ==='power cut') {
            return this.triangleWith(warning,'wi-lightning')
        }

        // Floods
        else if(warning.type ==='flood') {
            if(warning.warningLevel === 'amber') {
                return this.triangleWithCss(warning,'triangle-flood2')
            } else if(warning.warningLevel === 'red') {
                return this.triangleWithCss(warning, 'triangle-flood3')
            } else {
                return this.triangleWithCss(warning, 'triangle-flood1')
            }
        }

        // Weather
        else {

            const weatherType = warning.type.toLowerCase()
            if(weatherType.startsWith('snow')) {
                return this.triangleWithCss(warning,'triangle-snow')
            }

            if(weatherType.startsWith('ice')) {
                return this.triangleWithCss(warning, 'triangle-ice')
            }

            if(weatherType.startsWith('rain')) {
                return this.triangleWith(warning, 'wi-rain')
            }

            if(weatherType.startsWith('wind')) {
                return this.triangleWith(warning, 'wi-cloudy-gusts')
            }

            if(weatherType.startsWith('fog')) {
                return this.triangleWith(warning, 'wi-fog')
            }

        }
        return this.triangleWith(warning, 'wi-rain')
    }

    triangleWith(warning, weatherIcon) {
        const wi = 'wi ' + weatherIcon

        return (<div className='warning-triangle' onClick={() => {this.props.onWarningClick(warning)}}>
            <i className={wi}></i>
        </div>)
    }

    triangleWithCss(warning, css) {
        return (<div className={css} onClick={() => {this.props.onWarningClick(warning)}}></div>)
    }

    render() {
        // Overall class name of row
        const warningMap = {
            'green': 'wp',
            'yellow': 'wp alert-info',
            'amber': 'wp alert-warning',
            'red': 'wp alert-danger'
        }

        // Map the warning type and severity to correct image/icon combo
        let warning = this.props.warning

        const warningDetail =
            <div className="warning-details" >
                <div>
                    {warning.detail}
                </div>
                <div>
                    {this.generateTimeFragment('From', warning.validFrom)} {this.generateTimeFragment('to', warning.validTo)}
                </div>
                <div>
                    <a className="more" href="#">National Power</a>
                </div>
            </div>


        return (
            <div className={warningMap[warning.warningLevel]} >
                <div className="warning-row">
                    {this.generateWarningIcon(warning)}
                    <div className="warning-stuff">
                        <a className="more" href="#" onClick={this.showDetail}>{warning.text}</a>
                        <div onClick={() => {this.props.onWarningClick(warning)}}>{warning.area}</div>
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