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
    }

    polygonOptionsFor(warning) {
        let fill = '#0099ff'
        if(warning.warningLevel) {
            // Met office levels
            let warnLevel = warning.warningLevel.toUpperCase()
            switch(warnLevel) {
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

       return  {
            strokeColor: '#000000',
            strokeOpacity: 0.0,
            strokeWeight: 1,
            fillColor: fill,
            fillOpacity: 0.35
        };
    }

    polygonClick(warning) {
        console.log(warning.text.substring(0,10))
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
            if(warning.polygon) {
               return <Polygon paths={warning.polygon} options={this.polygonOptionsFor(warning)} onClick={this.polygonClick(warning)} />
            }
        })
     }

    </GoogleMap>
  }
            />
        );
    }
}