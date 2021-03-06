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

        let dateString = null
        if(date.getDay() !== now.getDay() || date.getMonth() !== now.getMonth() || date.getYear() !== now.getYear()) {
            dateString = date.toLocaleDateString('en-GB') +' '
        }

        const in12 = date.getHours() % 12
        const iconForTime = 'wi wi-time-' + (in12 === 0 ? 12 : in12)

        return <span>{label} {dateString}<i className={iconForTime}>{pad(date.getHours()) +':' + pad(date.getMinutes())}</i></span>
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

        const renderUrl = function(url) {
            if(url) {
                const target = (url.href.substr(0,4) === 'http') ? '_bank' : '_self'
                return <div><a target={target} href={url.href}>{url.name}</a></div>
            }
        }

        const warningDetail =
            <div className="warning-details" onClick={this.showDetail} >
                <p><strong>Where: </strong>{warning.area}</p>
                <p>{warning.detail}</p>
                <p><strong>When: </strong>
                    {this.generateTimeFragment('From', warning.validFrom)} {this.generateTimeFragment('to', warning.validTo)}
                </p>
                <p>
                    { warning.phone.map((phone => <strong>{phone}</strong>))}
                </p>
                <p>
                    { warning.url.map((url => renderUrl(url)))}
                </p>
            </div>


        return (
            <div className={warningMap[warning.warningLevel]} >
                <div className="warning-row">
                    {this.generateWarningIcon(warning)}
                    <div className="warning-stuff">
                        <div onClick={this.showDetail}>{warning.text}</div>
                        <div className="show-more" onClick={() => {this.props.onWarningClick(warning)}}>I</div>
                        <div className="warning-area" onClick={this.showDetail}>{warning.area}</div>
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