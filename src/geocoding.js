'use strict'

require('whatwg-fetch')

/**
 * Handles converting addresses and location coordinates into an object with a valid uk postcode and coordinates
 */
export default class Geocoding {
    constructor(geo = new google.maps.Geocoder()) {
        // Default to google geocoder
        this.geocoder = geo
        this.processGoogleGeocodeResults = this.processGoogleGeocodeResults.bind(this)
    }

    processAddress(address) {
        return this.geocodeAddress(address)
            .then(this.processGoogleGeocodeResults)
    }

    // Google geocode an address. May or may not return full postcode
    geocodeAddress(address) {
        return new Promise((resolve, reject) => {
            this.geocoder.geocode({'address': address}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    resolve(results)
                } else {
                    reject(status)
                }
            })
        })
    }


    processGoogleGeocodeResults(results) {
        const loc = results[0].geometry.location
        const location = {lat: loc.lat(), lng: loc.lng()}

        let postcode = this.getPostcodeFromResults(results)

        // Its possible the geocoder has not found a postcode or that its only a partial match
        // i.e. BS6 with no incode instead of BS6 5RL.  Check if there is a space in it
        // if so we assume googles result is ok

        if (postcode !== null && postcode.indexOf(' ') !== -1) {
            console.log('got from google ', postcode)
            return {
                postcode: postcode,
                location: location
            }
        }
        console.log('using postcodes.io fallback, postcode is incomplete')


        return this.getPostcodeFromLocation(location)
    }

    getPostcodeFromLocation(location) {
        console.log('getPostcodeFromLocation', location)
        return fetch('https://api.postcodes.io/postcodes?lon=' + location.lng + '&lat=' + location.lat + '&limit=1')
            .then(response => response.json())
            .then(data => {
                let postcode = data.result[0].postcode
                return {
                    postcode: postcode,
                    location: location
                }
            })
    }

    getPostcodeFromResults(results) {
        console.log('get from results')
        for (var i = 0; i < results.length; i++) {
            for (var j = 0; j < results[i].address_components.length; j++) {
                for (var k = 0; k < results[i].address_components[j].types.length; k++) {
                    if (results[i].address_components[j].types[k] === "postal_code") {
                        return results[i].address_components[j].short_name;
                    }
                }
            }
        }
        return null;
    }

}

