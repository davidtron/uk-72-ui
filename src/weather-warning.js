'use strict'

require('whatwg-fetch')
import lscache from 'lscache'


export default class WeatherWarning {
    constructor() {
        lscache.setBucket('uk72')
        lscache.flushExpired()
    }

    getWeatherData() {
        let weather = lscache.get('weather');
        if(weather) {
            console.log('fetched weather from cache', weather)
            return new Promise((resolve, reject) => resolve(weather))
        } else {
            return fetch('https://3tvc4lnrvi.execute-api.eu-west-1.amazonaws.com/development/weather/warnings')
                .then(response => response.json())
                .then(weather => {
                    console.log('fetched weather from API', weather)
                    lscache.set('weather', weather, 240) // cache for 4 hours
                    return weather
                })
        }
    }

    getWarning(location) {
        console.log('Get weather warnings for ', location)

        return this.getWeatherData()
            .then(weather => {
                let warnings = []

                // check if the warning is within the given location
                weather.forEach((warning, index) => {



                    // TODO - this should not rely on google maps use a different lib for poly work
                    // Convert polygon into a google polygon
                    const googleCoordsOfWarning = warning.coord.map(coordinate => {
                        return { lat: coordinate.latitude, lng: coordinate.longitude }
                    })

                    const poly = new google.maps.Polygon({paths: googleCoordsOfWarning})
                    const center = poly.my_getBounds().getCenter()

                    // Check if our coords are within it
                    //if(google.maps.geometry.poly.containsLocation(location.location, poly)) {
                        warnings.push({
                            text: warning.warningText,
                            location: { lat: center.lat(), lng: center.lng()},
                            polygon: googleCoordsOfWarning,
                            type: warning.weather,
                            validFrom: warning.validFrom,
                            validTo: warning.validTo,
                            warningClass: warning.warningClass,
                            warningImpact: warning.warningImpact,
                            warningLevel: warning.warningLevel,
                            warningLikelihood: warning.warningLikelihood,
                            key: warning.id
                        })
                    //}

                    // add to
                })
                return warnings
            })

    }
}


google.maps.Polygon.prototype.my_getBounds=function(){
    var bounds = new google.maps.LatLngBounds()
    this.getPath().forEach(function(element,index){bounds.extend(element)})
    return bounds
}