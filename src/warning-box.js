'use strict'

import React, { Component, PropTypes } from 'react'
import {default as update} from "react-addons-update";
import WarningList from './warning-list'
import PostcodeForm from './postcode-form'
import SimpleMapPage from './map'
import WeatherWarning from './weather-warning'
import Geocoding from './geocoding'


export default class WarningBox extends Component {
    constructor(props) {
        super(props)

        this.state = {
            warnings: [],
            mapOptions: {
                zoom: 9,
                center: { lat: 51.6799019, lng: -0.4235076 }
            }
        }

        this.geocoding = new Geocoding()
        this.weatherWarning = new WeatherWarning()

        this.handlePostcodeSubmit = this.handlePostcodeSubmit.bind(this)
        this.selectLocation = this.selectLocation.bind(this)
    }

    loadWarnings() {

        // Dummy for layout - TODO - remove
        let d = [
            {text: 'warning 1', type: 'weather', location : { lat: 51.6538367, lng: -0.4145852}},
            {text: 'warning 2', type: 'power', location : { lat: 51.4272403, lng: -3.1891529} }
        ]
        this.setState({ warnings: d})


        // Look at spreading the promise to run in parallel
        this.weatherWarning.getWarning(this.state.currentLocation)
            .then(warnings => this.appendWarnings(warnings))
            .catch(err => console.error(err))

    }

    appendWarnings(warnings) {
        const oldMarkers = this.state.warnings;
        const markers = update(oldMarkers, {
            $push: warnings
        });

        this.setState({warnings: markers})
    }

    componentDidMount () {

        this.geocoding.getLocationAndPostcodeFromGeolocation()
            .then(position => {
                this.selectLocation(position)
                this.loadWarnings()
            })
            .catch(err => console.error(err))
    }

    selectLocation(location) {
        this.setState({
            mapOptions: {
                zoom: 17,
                panTo: location.location
            },
            currentLocation: location
        });
    }


    handlePostcodeSubmit(locationAndPostcode) {
        this.selectLocation(locationAndPostcode)
        this.loadWarnings()
    }

    render() {
        const mapHeight = {
            height: 250
        }

        return (
            <div className='comment-box'>
                <h1>Warnings</h1>
                <WarningList warnings={this.state.warnings} onWarningClick={this.selectLocation}/>
                <PostcodeForm onPostcodeSubmit={this.handlePostcodeSubmit}/>

                <div style={mapHeight}><SimpleMapPage mapOptions={this.state.mapOptions} warnings={this.state.warnings}/></div>
            </div>
        )
    }
}

WarningBox.propTypes = {}
