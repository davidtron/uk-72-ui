'use strict'
import React, { Component, PropTypes } from 'react'
import {GoogleMap, GoogleMapLoader, Marker, Polygon} from 'react-google-maps'
import {default as update} from 'react-addons-update'
import throttle from 'lodash.throttle'

export default class WarningMap extends Component {
    constructor(props) {
        super(props)
        this.reportBoundsChanged = throttle(this.reportBoundsChanged, 250)
    }

    polygonOptionsFor(warning) {

        const metOffice = {
            'yellow': '#ffff66',
            'amber' : '#ff9933',
            'red'   : '#ff0000',
            'green' : '#33cc33'
        }

        const flood = {
            'yellow': '#6699ff',
            'amber' : '#3366ff',
            'red'   : '#0033cc',
            'green' : '#99ccff'
        }

        //flood, power cut

        let fill = '#0099ff'
        if(warning.type ==='flood') {
            fill = flood[warning.warningLevel]
        } else if(warning.type ==='power cut') {
            fill = '#ff0000'
        } else {
            fill = metOffice[warning.warningLevel]
        }

        return {
            strokeColor: fill,
            strokeOpacity: 0.75,
            strokeWeight: 1,
            fillColor: fill,
            fillOpacity: 0.35
        };
    }

    polygonClick(warning) {
        // TODO scroll list to the item
        console.log(warning.text.substring(0, 10))
    }

    reportBoundsChanged() {
        const zoomLevel = this.map.getZoom();
        const bounds = this.map.getBounds();

        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()

        // Call back to the parent the zoom level and bounds
        this.props.onMapChange({
            'zoom': zoomLevel,
            'bounds': {
                'ne': {'lat': ne.lat(), 'lng': ne.lng()},
                'sw': {'lat': sw.lat(), 'lng': sw.lng()}
            }
        })
    }

    callOnMapRender(map, props) {
        if (!map) return

        if (props.mapOptions.setBounds) {
            const bounds = props.mapOptions.setBounds
            map.fitBounds(new google.maps.LatLngBounds(bounds.sw, bounds.ne))
        }
    }


    render() {
        return (
            <GoogleMapLoader
                containerElement={
                 <div {...this.props} style={{ height: "100%" }} ></div>
                }
                googleMapElement={
    <GoogleMap
      ref={map => {this.map = map; this.callOnMapRender(map, this.props)}}

      {...this.props.mapOptions}
      onBoundsChanged={::this.reportBoundsChanged}
     >
     {
        this.props.warnings.map((warning, index) => {
            if(warning.polygons) {
               return warning.polygons.map((polygon, index) => {
                 return <Polygon paths={polygon}
                                 options={this.polygonOptionsFor(warning)}
                                 onClick={() => this.polygonClick(warning)}
                         />
               })
            }
        })
     }
    </GoogleMap>
  }
            />
        );
    }
}

WarningMap.propTypes = {
    mapOptions: PropTypes.object.isRequired,
    warnings: PropTypes.array.isRequired,
    onMapChange: PropTypes.func.isRequired
}