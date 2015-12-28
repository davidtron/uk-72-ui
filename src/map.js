'use strict'
import {default as React, Component} from "react";

import {GoogleMap, GoogleMapLoader, Marker, Polygon} from "react-google-maps";
import {default as update} from "react-addons-update";


export default class SimpleMapPage extends Component {
    constructor(props) {
        super(props)
    }

    mapCallback(map, props) {
        // Invokes the panTo function on the underlying map if we set new map options
        if (!map) return
        if (props.mapOptions.panTo) {
            map.panTo(props.mapOptions.panTo)
        }

        // If we wanted to add geojson directly we could do it here if we could load it without CORS
        //console.log(map)
        //map.props.map.data.loadGeoJson('http://environment.data.gov.uk/flood-monitoring/id/floodAreas/122WAC953/polygon');
        //
        ////map.props.map.data.addGeoJson(data);
        //map.props.map.data.setStyle(function (feature) {
        //    return {
        //        fillColor: '#0099ff',
        //        strokeWeight: 2,
        //        fillOpacity: 0.35
        //    };
        //});
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
        //console.log(warning.text.substring(0, 10))
    }

    render() {

        return (
            <GoogleMapLoader containerElement={
                 <div {...this.props} style={{ height: "100%" }} ></div>
                }
                             googleMapElement={
    <GoogleMap
      ref={(map) => this.mapCallback(map, this.props)}
      {...this.props.mapOptions}
     >
     {  // Display any polygons
        this.props.warnings.map((warning, index) => {
            if(warning.polygons) {
               return warning.polygons.map((polygon, index) => {
                 return <Polygon paths={polygon} options={this.polygonOptionsFor(warning)} onClick={this.polygonClick(warning)} />
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