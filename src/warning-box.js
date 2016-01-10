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

    // Used to move the map when selecting an item from the list
    // we do not want to listen to any new bounds as that would cause the list to filter to one item
    moveMap(bounds, location) {

        const newZoom = this.map.calculateZoomForBounds(bounds)
        console.log('new zoom -> ', newZoom)

        this.setState({
            mapOptions: {
                center: location,
                zoom: newZoom
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
                center: location.location,
                zoom: 15
            }
        });
        const newZoom = this.map.reportBoundsChanged()
    }


    handlePostcodeSubmit(locationAndPostcode) {
        this.selectLocation(locationAndPostcode)
        this.loadWarnings()
    }

    handleMapChange(change) {


        // Filter the results based on the bounds and zoom

        // is there any way to ignore map changes triggered by us
        console.log(change)
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
