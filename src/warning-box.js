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
            warnings: [],
            allWarnings: [],
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
        this.handleMapChange = this.handleMapChange.bind(this)
    }

    loadWarnings() {
        this.setState({ warnings: [], allWarnings: []})


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
        if(newWarnings && newWarnings.length > 0) {
            const oldMarkers = this.state.allWarnings;
            const markers = update(oldMarkers, {
                $push: newWarnings
            });

            this.setState({allWarnings: markers})
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

    moveMap(bounds) {

        this.setState({
            mapOptions: {
                currentBounds: bounds
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
                currentBounds: null,
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

    handleMapChange(change) {
        // Create a prepared bound polygon
        const mapBoundsPolygon = [
            { lat: change.bounds.ne.lat, lng: change.bounds.ne.lng },
            { lat: change.bounds.ne.lat, lng: change.bounds.sw.lng },
            { lat: change.bounds.sw.lat, lng: change.bounds.sw.lng },
            { lat: change.bounds.sw.lat, lng: change.bounds.ne.lng }
        ]

        geolib.preparePolygonForIsPointInsideOptimized(mapBoundsPolygon)

        if(this.state.allWarnings) {
            const filt = this.state.allWarnings.filter(warning => {

                const a = geolib.isPointInsideWithPreparedPolygon(warning.bounds.sw, mapBoundsPolygon)
                const b = geolib.isPointInsideWithPreparedPolygon(warning.bounds.ne, mapBoundsPolygon)

                return a || b
            })


            this.setState({
                warnings: filt,
                mapOptions: {currentBounds: null}
            })
            console.log('-map change  -> ',change)
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
                    <WarningMap ref={map => {this.map = map}} mapOptions={this.state.mapOptions} warnings={this.state.warnings} onMapChange={this.handleMapChange}/>
                </div>
            </div>
        )
    }
}

WarningBox.propTypes = {}
