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
import WarningFilter from './warning-filter'
import values from 'object.values'

export default class WarningBox extends Component {
    constructor(props) {
        super(props)

        if (!Object.values) {
            values.shim();
        }

        this.state = {
            allWarnings: {},   // in memory cache of all warnings received
            warningsList: [],      // warnings rendered on the list
            warningsOnMap: [],     // warnings rendered on the map
            mapOptions: {
                zoom: 9,
                center: {lat: 51.6799019, lng: -0.4235076}
            }
        }

        this.polygonsThatAreLoading = {}

        this.geocoding = new Geocoding()
        this.weatherWarning = new WeatherWarning()
        this.floodWarning = new FloodWarning()
        this.powerWarning = new PowerWarning()

        this.filterWarnings = new WarningFilter()

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

    moveMap(warning) {
        // If polygon is not yet loaded, retrieve it
        if (!warning.polygons && warning.polygonsFunction) {
            this.loadPolygonDataUsingPromise(warning)
        }

        this.setState({
            currentWarningKey: warning.key,
            mapOptions: {
                setBounds: warning.bounds
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
        const selectedWarningKey = this.state.currentWarningKey

        if (allWarningsObj) {

            const warningsInList = Object.values(allWarningsObj)
                .filter(this.filterWarnings.selectVisibleWarnings(currentBoundsAndZoom))
                .sort(this.filterWarnings.sortWarnings())
            const warningsOnMap = warningsInList.filter(this.filterWarnings.selectWarningsForMap(currentBoundsAndZoom, selectedWarningKey))

            // Load any polygons required for map that are not yet loaded.
            warningsOnMap.forEach(warning => {
                if (!warning.polygons && warning.polygonsFunction) {
                    this.loadPolygonDataUsingPromise(warning);
                }
            })

            this.setState({
                warningsList: warningsInList,
                warningsOnMap : warningsOnMap,
                mapOptions: {setBounds: null}     // Clear this so the map doesnt try to move
            })
        }
    }

    loadPolygonDataUsingPromise(warning) {
        const  warningKey = warning.key

        if(! this.polygonsThatAreLoading[warningKey]) {
            console.log('load polygon for ' + warningKey)
            this.polygonsThatAreLoading[warningKey] = true;
            warning.polygonsFunction.call()
                .then(polygonData => {
                    // Update allWarnings with received data
                    console.log('received polygon data for ' + warningKey)

                    warning.polygons = polygonData

                    const updatedAllWarnings = update(this.state.allWarnings, {[warningKey]: {$set: warning}})

                    // Find index of updated item in current warnings
                    const indexOf = this.state.warningsOnMap.findIndex((element, index, array) => {
                        if (element.key === warningKey) {
                            return true
                        }
                        return false
                    })

                    // Splice in the new value to the array
                    const oldWarnings = this.state.warningsOnMap
                    const updatedCurrentWarnings = update(oldWarnings, {$splice: [[indexOf, 1, warning]]})

                    this.setState({
                        allWarnings: updatedAllWarnings,
                        warningsOnMap: updatedCurrentWarnings
                    })

                    this.polygonsThatAreLoading[warningKey] = null;
                })
                .catch(err => {
                    console.log('Could not process polygon for warning ' + warningKey, err)
                    this.polygonsThatAreLoading[warningKey] = null;
                })
        } else {
            console.log('already requested load polygon for ' + warningKey)
        }
    }

    render() {


        return (
            <div className='comment-box row'>
                <div className='col-md-4 warning-list'>
                    <PostcodeForm onPostcodeSubmit={this.handlePostcodeSubmit}/>
                    <WarningList warnings={this.state.warningsList} onWarningClick={this.moveMap}/>
                </div>
                <div className='col-md-8 warning-map'>
                    <WarningMap ref={map => {this.map = map}} mapOptions={this.state.mapOptions}
                                warnings={this.state.warningsOnMap} onMapChange={this.handleMapChange} currentLocation={this.state.currentLocation} currentWarningKey={this.state.currentWarningKey}/>
                </div>
            </div>
        )
    }
}

WarningBox.propTypes = {}
