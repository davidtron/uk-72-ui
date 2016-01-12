'use strict'


import React, { Component, PropTypes } from 'react'
import {default as update} from "react-addons-update";
import WarningList from './warning-list'
import PostcodeForm from './postcode-form'
import WarningMap from './map'
import WeatherWarning from './weather-warning'
import FloodWarning from './flood-warning'
import PowerWarning from './power-warning'
import Geocoding from './geocoding'
import geolib from 'geolib'


export default class WarningBox extends Component {
    constructor(props) {
        super(props)

        this.state = {
            warnings: [],      // warnings rendered on the list and on the map
            allWarnings: {},   // in memory cache of all warnings received
            mapOptions: {
                zoom: 9,
                center: {lat: 51.6799019, lng: -0.4235076}
            }
        }

        this.geocoding = new Geocoding()
        this.weatherWarning = new WeatherWarning()
        this.floodWarning = new FloodWarning()
        this.powerWarning = new PowerWarning()

        this.handlePostcodeSubmit = this.handlePostcodeSubmit.bind(this)
        this.selectLocation = this.selectLocation.bind(this)
        this.moveMap = this.moveMap.bind(this)
        this.handleMapChange = this.handleMapChange.bind(this)
    }

    loadWarnings() {

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
        console.log('appending warnings', Object.keys(newWarnings).length)
        if (newWarnings && Object.keys(newWarnings).length > 0) {
            var allWarnings = this.state.allWarnings;
            var updatedAllWarnings = update(allWarnings, {$merge: newWarnings});
            this.setState({allWarnings: updatedAllWarnings})
        }
    }


    componentDidMount() {

        this.geocoding.getLocationAndPostcodeFromGeolocation()
            .then(position => {
                this.selectLocation(position)
                this.loadWarnings()
            })
            .catch(err => console.error(err))
    }

    moveMap(bounds) {

        this.setState({
            mapOptions: {
                setBounds: bounds
            }
        });
    }

    // Used only after geolocating to set a location (and not the bounds)
    // we want the bounds passed back to filter warnings list
    selectLocation(location) {
        console.log('trying to set location', location)
        this.setState({
            currentLocation: location,
            mapOptions: {
                setBounds: null,
                center: location.location,
                zoom: 15
            }
        });
        this.map.reportBoundsChanged()
    }


    handlePostcodeSubmit(locationAndPostcode) {
        this.selectLocation(locationAndPostcode)
        this.loadWarnings()
    }

    handleMapChange(currentBoundsAndZoom) {
        const allWarningsObj = this.state.allWarnings
        if (allWarningsObj) {

            // Create a prepared bound polygon
            const mapBoundsPolygon = [
                {lat: currentBoundsAndZoom.bounds.ne.lat, lng: currentBoundsAndZoom.bounds.ne.lng},
                {lat: currentBoundsAndZoom.bounds.ne.lat, lng: currentBoundsAndZoom.bounds.sw.lng},
                {lat: currentBoundsAndZoom.bounds.sw.lat, lng: currentBoundsAndZoom.bounds.sw.lng},
                {lat: currentBoundsAndZoom.bounds.sw.lat, lng: currentBoundsAndZoom.bounds.ne.lng}
            ]

            geolib.preparePolygonForIsPointInsideOptimized(mapBoundsPolygon)

            const isVisibleOnMap = function (warning, mapBoundsPolygon) {
                const a = geolib.isPointInsideWithPreparedPolygon(warning.bounds.sw, mapBoundsPolygon)
                const b = geolib.isPointInsideWithPreparedPolygon(warning.bounds.ne, mapBoundsPolygon)

                return a || b
            }

            const currentWarnings = []


            Object.keys(allWarningsObj).forEach(warningKey => {
                const warning = allWarningsObj[warningKey]

                if (isVisibleOnMap(warning, mapBoundsPolygon)) {
                    if (!warning.polygons && warning.polygonsFunction) {
                        console.log('invoking polygon promise for ' + warningKey)
                        warning.polygonsFunction.call()
                            .then(polygonData => {
                                // Update allWarnings with received data
                                console.log('received polygon data for ' + warningKey)

                                warning.polygons = polygonData

                                const updatedAllWarnings = update(this.state.allWarnings, {[warningKey]: {$set: warning}})

                                // Find index of updated item in current warnings
                                const indexof = this.state.warnings.findIndex((element, index, array) => {
                                    if (element.key === warningKey) {
                                        return true
                                    }
                                    return false
                                })

                                // Splice in the new value to the array
                                const oldWarnings = this.state.warnings
                                const updatedCurrentWarnings = update(oldWarnings, {$splice: [[indexof, 1, warning]]})

                                this.setState({
                                    allWarnings: updatedAllWarnings,
                                    warnings: updatedCurrentWarnings
                                })
                            })
                            .catch(err => console.log('Could not process polygon for warning ' + warningKey, err))
                    }

                    currentWarnings.push(warning)
                }

            })


            this.setState({
                warnings: currentWarnings,
                mapOptions: {setBounds: null}
            })
        }

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
                <div className='col-md-8' style={mapHeight}>
                    <WarningMap ref={map => {this.map = map}} mapOptions={this.state.mapOptions}
                                warnings={this.state.warnings} onMapChange={this.handleMapChange}/>
                </div>
            </div>
        )
    }
}

WarningBox.propTypes = {}
