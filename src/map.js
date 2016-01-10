'use strict'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import {GoogleMap, GoogleMapLoader, Marker, Polygon} from 'react-google-maps'
import {default as update} from 'react-addons-update'

export default class WarningMap extends Component {
    constructor(props) {
        super(props)
        this.calculateZoomForBounds.bind(this)
    }

    polygonOptionsFor(warning) {
        let fill = '#0099ff'
        if (warning.warningLevel) {
            // Met office levels
            let warnLevel = warning.warningLevel.toUpperCase()
            switch (warnLevel) {
                case 'YELLOW':
                    fill = '#ffff66'
                    break;
                case 'AMBER':
                    fill = '#ff9933'
                    break;
                case 'RED':
                    fill = '#ff0000'
                    break;
                default:
                    fill = '#33cc33'
            }
        }

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
        const zoomLevel = this.refs.map.getZoom();
        const bounds = this.refs.map.getBounds();

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

    calculateZoomForBounds(bounds) {
        // http://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds

        const domNode = ReactDOM.findDOMNode(this)
        const width = domNode.offsetWidth
        const height = domNode.offsetHeight
        const mapDim = {height: height, width: width}

        const WORLD_DIM = {height: 256, width: 256}
        const ZOOM_MAX = 16 // can be 21

        function latRad(lat) {
            const sin = Math.sin(lat * Math.PI / 180)
            const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
            return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
        }

        function zoom(mapPx, worldPx, fraction) {
            return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
        }

        const ne = bounds.ne
        const sw = bounds.sw

        const latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI

        const lngDiff = ne.lng - sw.lng;
        const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360

        const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction)
        const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction)

        return Math.min(latZoom, lngZoom, ZOOM_MAX)
    }


    render() {
        return (
            <GoogleMapLoader
                containerElement={
                 <div {...this.props} style={{ height: "100%" }} ></div>
                }
                googleMapElement={
    <GoogleMap
      ref="map"
      {...this.props.mapOptions}
      onDragEnd={::this.reportBoundsChanged}
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