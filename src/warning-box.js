'use strict'

import React, { Component, PropTypes } from 'react'
import WarningList from './warning-list'
import PostcodeForm from './postcode-form'
import SimpleMapPage from './map'
import { default as canUseDOM } from "can-use-dom"

require('whatwg-fetch')

const geolocation = (
    canUseDOM && navigator.geolocation || {
        getCurrentPosition: (success, failure) => {
            failure("Your browser doesn't support geolocation.");
        }
    }
);


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

        this.handlePostcodeSubmit = this.handlePostcodeSubmit.bind(this)
        this.selectLocation = this.selectLocation.bind(this)
    }

    loadComments() {

        let d = [
            {text: 'warning 1', type: 'weather', location : { lat: 51.6538367, lng: -0.4145852}},
            {text: 'warning 2', type: 'power', location : { lat: 51.4272403, lng: -3.1891529} }
        ]


        this.setState(
            {
                warnings: d
            }
        )



        //fetch(this.props.url)
        //  .then(response => response.json())
        //  .then(data => this.setState({ data: data }))
        //  .catch(err => console.error(this.props.url, err.toString()))
    }

    componentDidMount () {
        geolocation.getCurrentPosition((position) => {
            this.setState({
                mapOptions: {
                    zoom: 15,
                    panTo: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                }
            });



        }, (reason) => {
            console.log(reason);
        });

        /*
         Try a geolocate
         then convert to a postcode
         or default
         */

        this.loadComments();
    }

    selectLocation(location) {
        this.setState({
            mapOptions: {
                zoom: 17,
                panTo: location
            }
        });
    }


    handlePostcodeSubmit(locationAndPostcode) {

        this.selectLocation(locationAndPostcode.location)

        // Now submit the postcode / and or locations and process the data

        console.log('in the right place')
        //const comments = this.state.warnings
        //const newComments = comments.concat([comment])

        //this.setState({warnings: newComments})

        //fetch(this.props.url, {
        //  method: 'post',
        //  headers: {
        //    'Accept': 'application/json',
        //    'Content-Type': 'application/json'
        //  },
        //  body: JSON.stringify(comment)
        //})
        //.then(response => response.json())
        //.then(data => this.setState({ warnings: data }))
        //.catch(err => console.error(this.props.url, err.toString()))
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

                <div style={mapHeight}><SimpleMapPage mapOptions={this.state.mapOptions}/></div>
            </div>
        )
    }
}

WarningBox.propTypes = {}
