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
                    if (weather.errorType) {
                        throw new Error('Could not process weather results:\n' + JSON.stringify(weather))
                    }
                    console.log('fetched weather from API', weather)
                    lscache.set('weather', weather, 240) // cache for 4 hours
                    return weather
                })
        }
    }

    static warningMapping(level) {

        let warnLevel = level.toUpperCase()
        switch (warnLevel) {
            case 'YELLOW':
                return 'yellow'
            case 'AMBER':
                return 'amber'
            case 'RED':
                return 'red'
            default:
                return 'green'
        }
    }

    static firstUpper(string) {
        if(!string) {
            return ''
        }
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
    }

    getWarning(location) {
        console.log('Get weather warnings for ', location)

        return this.getWeatherData()
            .then(weather => {
                let warnings = {}

                // check if the warning is within the given location
                weather.forEach((weatherWarning, index) => {

                    const weatherWarningPolygon = weatherWarning.coord.map(coordinate => {
                        return {lat: coordinate.latitude, lng: coordinate.longitude}
                    })

                    const bounds = geolib.getBounds(weatherWarning.coord)
                    const center = geolib.getCenter(weatherWarning.coord)

                    const warning = {
                        text: WeatherWarning.firstUpper(weatherWarning.weather) + ' ' + weatherWarning.warningClass.toLowerCase(),
                        detail: weatherWarning.warningText,
                        location: {lat: parseFloat(center.latitude), lng: parseFloat(center.longitude)},
                        polygons: [weatherWarningPolygon],
                        bounds: {
                            sw: {lat: bounds.minLat, lng: bounds.minLng},
                            ne: {lat: bounds.maxLat, lng: bounds.maxLng}
                        },
                        type: weatherWarning.weather,
                        validFrom: weatherWarning.validFrom,
                        validTo: weatherWarning.validTo,
                        warningClass: weatherWarning.warningClass,
                        warningImpact: weatherWarning.warningImpact,
                        warningLevel: WeatherWarning.warningMapping(weatherWarning.warningLevel),
                        warningLikelihood: weatherWarning.warningLikelihood,
                        key: weatherWarning.id
                    }

                    warnings[warning.key] = warning
                })
                return warnings
            })

    }
}
