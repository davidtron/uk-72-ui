'use strict'

require('whatwg-fetch')
import lscache from 'lscache'
import PostcodeToPes from './postcode-to-pes'
import geolib from 'geolib'


export default class PowerWarning {
    constructor() {
        lscache.setBucket('uk72')
        lscache.flushExpired()
        this.postcodeToPes = new PostcodeToPes()
    }

    cacheResults(dno) {
        // Cannot cache results from Scottish Power Energy Networks (13, 18) since they are per postcode
        // Cannot cache results from Northern Power grid (15,23) since they are per postcode
        if (['13', '18', '15', '23'].indexOf(dno) > -1) return false
        else return true
    }

    getPowerData(location) {

        let powerPromises = []
        // Lookup the DNO based on postcode, some areas are covered by multiple operators so we expect dnos to be an array
        const dnos = this.postcodeToPes.lookupPes(location.postcode).split(',')


        dnos.forEach(dno => {

            let powerWarnings = lscache.get('power_' + dno);
            if (powerWarnings) {
                console.log('fetched power warnings for dno ' + dno + 'from cache', powerWarnings)
                powerPromises.push(new Promise((resolve, reject) => resolve(powerWarnings)))
            } else {
                powerPromises.push(fetch('https://3tvc4lnrvi.execute-api.eu-west-1.amazonaws.com/development/power/warnings', {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        postcode: location.postcode,
                        dno: dno
                    })
                })
                    .then(response => response.json())
                    .then(power => {
                        console.log('fetched power warnings from API for DNO ' + dno, power)

                        // Not all dno data can be cached as some is specific to the given postcode.
                        if (this.cacheResults(dno)) {
                            lscache.set('power_' + dno, power, 60) // cache for 60mins
                        }
                        return power
                    }))
            }
        })

        return Promise.all(powerPromises)


    }

    getWarning(location) {
        // console.log('Get power warnings for ', location)


        return this.getPowerData(location)
            .then(warningsForDno => {

                let warnings = []
                warningsForDno.forEach(setOfWarnings => {


                    setOfWarnings.outages.forEach(outage => {
                        // Filter the warnings based on location, include any within 100m
                        const distanceToYourLocation = 50000 // set to 100 when finish testing

                        const distance = geolib.getDistance(location.location, outage)
                        if (distance < distanceToYourLocation) {

                            const warning = {
                                text: outage.info,
                                location: {lat: outage.latitude, lng: outage.longitude},
                                polygons: [this.createBoundingPolygon(outage, 50)],
                                type: 'power cut',
                                validFrom: outage.timeOfIncident,
                                validTo: outage.restorationTime,
                                url: setOfWarnings.uri,
                                key: outage.latitude + outage.longitude
                            }


                            warnings.push(warning)
                        }
                    })

                })

                return warnings
            })
    }


    createBoundingPolygon(outage, distance) {

        const latitude = outage.latitude;
        const longitude = outage.longitude;

        // 6378000 Size of the Earth (in meters)
        const longitudeD = (Math.asin(distance / (6378000 * Math.cos(Math.PI * latitude / 180)))) * 180 / Math.PI;
        const latitudeD = (Math.asin(distance / 6378000)) * 180 / Math.PI;

        const latitudeMax = latitude + (latitudeD);
        const latitudeMin = latitude - (latitudeD);
        const longitudeMax = longitude + (longitudeD);
        const longitudeMin = longitude - (longitudeD);

        return [
            {lat: latitudeMax, lng: longitudeMax},
            {lat: latitudeMax, lng: longitudeMin},
            {lat: latitudeMin, lng:longitudeMin},
            {lat: latitudeMin, lng: longitudeMax}
      ]
    }
}