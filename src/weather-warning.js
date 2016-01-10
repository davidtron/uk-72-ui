'use strict'

import defaultMember from 'whatwg-fetch'
import lscache from 'lscache'
import geolib from 'geolib'

export default class WeatherWarning {
    constructor() {
        lscache.setBucket('uk72')
        lscache.flushExpired()
    }

    getWeatherData() {
        let weather = lscache.get('weather');
        if (weather) {
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

                    const weatherWarningPolygon = warning.coord.map(coordinate => {
                        return {lat: coordinate.latitude, lng: coordinate.longitude}
                    })

                    const bounds = geolib.getBounds(warning.coord)
                    const center = geolib.getCenter(warning.coord)

                    warnings.push({
                        text: warning.warningText,
                        location: {lat: parseFloat(center.latitude), lng: parseFloat(center.longitude)},
                        polygons: [weatherWarningPolygon],
                        bounds: {
                            sw: { lat: bounds.minLat, lng: bounds.minLng },
                            ne: { lat: bounds.maxLat, lng: bounds.maxLng }
                        },
                        type: warning.weather,
                        validFrom: warning.validFrom,
                        validTo: warning.validTo,
                        warningClass: warning.warningClass,
                        warningImpact: warning.warningImpact,
                        warningLevel: warning.warningLevel,
                        warningLikelihood: warning.warningLikelihood,
                        key: warning.id
                    })
                })
                return warnings
            })

    }
}
