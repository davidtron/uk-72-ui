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
        let fill = '#0099ff'

        /*
        Possible

        weather warningLevel is string
            values {'AMBER','YELLOW','RED'}

        flood warningLevel is number

        TODO - map in flood-warning and weather-warning to same type
        - then its the map responsibility to use the type and level to pick correct polygon options

         */


        //if (warning.warningLevel) {
        //
        //    let warnLevel = warning.warningLevel.toUpperCase()
        //    switch (warnLevel) {
        //        case 'YELLOW':
        //            fill = '#ffff66'
        //            break;
        //        case 'AMBER':
        //            fill = '#ff9933'
        //            break;
        //        case 'RED':
        //            fill = '#ff0000'
        //            break;
        //        default:
        //            fill = '#33cc33'
        //    }
        //}

        return {
            strokeColor: '#000000',
            strokeOpacity: 0.0,
            strokeWeight: 1,
            fillColor: fill,
            fillOpacity: 0.35
        };
    }

    polygonClick(warning) {
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