'use strict'


import React, { Component, PropTypes } from 'react'
import {default as update} from "react-addons-update";
import WarningList from './warning-list'
import PostcodeForm from './postcode-form'
import SimpleMapPage from './map'
import WeatherWarning from './weather-warning'
import FloodWarning from './flood-warning'
import PowerWarning from './power-warning'
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
        this.floodWarning = new FloodWarning()
        this.powerWarning = new PowerWarning()

        this.handlePostcodeSubmit = this.handlePostcodeSubmit.bind(this)
        this.selectLocation = this.selectLocation.bind(this)
        this.moveMap = this.moveMap.bind(this)
    }

    loadWarnings() {

        this.setState({ warnings: []})


        // Look at spreading the promise to run in parallel
        this.weatherWarning.getWarning(this.state.currentLocation)
            .then(warnings => this.appendWarnings(warnings))
            .catch(err => console.error(err))

        this.floodWarning.getWarning(this.state.currentLocation)
            .then(warnings => this.appendWarnings(warnings))
            .catch(err => console.error(err))

        this.powerWarning.getWarning(this.state.currentLocation)
            .then(warnings => this.appendWarnings(warnings))
            .catch(err => console.error(err))



    }

    appendWarnings(newWarnings) {
        console.log('appending warnings', newWarnings.length)
        console.log('appending warnings', newWarnings)
        if(newWarnings && newWarnings.length > 0) {
            const oldMarkers = this.state.warnings;
            const markers = update(oldMarkers, {
                $push: newWarnings
            });

            this.setState({warnings: markers})
        }
    }

    componentDidMount () {

        this.geocoding.getLocationAndPostcodeFromGeolocation()
            .then(position => {
                this.selectLocation(position)
                this.loadWarnings()
            })
            .catch(err => console.error(err))
    }

    moveMap(location) {
        this.setState({
            mapOptions: {
                panTo: location,
                zoom: 15
            }
        });
    }

    selectLocation(location) {
        console.log('trying to set location', location)
        this.setState({
            currentLocation: location
        });
        this.moveMap(location.location)
    }


    handlePostcodeSubmit(locationAndPostcode) {
        this.selectLocation(locationAndPostcode)
        this.loadWarnings()
    }

    render() {
        const mapHeight = {
            height: 400
        }

        return (
            <div className='comment-box row'>
                <div className='col-md-4 warning-list'>
                    <h1>Warnings</h1>
                    <PostcodeForm onPostcodeSubmit={this.handlePostcodeSubmit}/>
                    <WarningList warnings={this.state.warnings} onWarningClick={this.moveMap}/>
                </div>
                <div className='col-md-8' style={mapHeight}><SimpleMapPage mapOptions={this.state.mapOptions} warnings={this.state.warnings}/></div>
            </div>
        )
    }
}

WarningBox.propTypes = {}
