'use strict'
import {default as React, Component} from "react";

import {GoogleMap, GoogleMapLoader, Marker} from "react-google-maps";
import {default as update} from "react-addons-update";


export default class SimpleMapPage extends Component {
    constructor(props) {
        super(props)
        this.state = {markers: []}
    }

    mapCallback(map, props) {
        // Invokes the panTo function on the underlying map if we set new map options
        if (!map) return
        if (props.mapOptions.panTo) {
            map.panTo(props.mapOptions.panTo)
        }
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
      {this.state.markers.map((marker, index) => {
        return (
          <Marker{...marker} />
        );
      })}
    </GoogleMap>
  }
            />
        );
    }
}