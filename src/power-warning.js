'use strict'

import defaultMember from 'whatwg-fetch'
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
                        if(power.errorType) {
                            throw new Error('Could not process power results:\n' + JSON.stringify(power))
                        }
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

        return this.getPowerData(location)
            .then(warningsForDno => {

                let warnings = {}
                warningsForDno.forEach(setOfWarnings => {

                    setOfWarnings.outages.forEach(outage => {

                        if (outage.latitude && outage.longitude) {

                            const bounds = geolib.getBoundsOfDistance(outage, 25)

                            // bounds[0] is southwest corner
                            const polygon = [
                                {lat: bounds[1].latitude, lng: bounds[1].longitude},
                                {lat: bounds[1].latitude, lng: bounds[0].longitude},
                                {lat: bounds[0].latitude, lng: bounds[0].longitude},
                                {lat: bounds[0].latitude, lng: bounds[1].longitude}
                            ]

                            const bounds2 = {
                                sw: { lat: bounds[0].latitude, lng: bounds[0].longitude },
                                ne: { lat: bounds[1].latitude, lng: bounds[1].longitude }
                            }



                            const warning = {
                                text: outage.info,
                                location: {lat: outage.latitude, lng: outage.longitude},
                                polygons: [polygon],
                                bounds: bounds2,
                                type: 'power cut',
                                validFrom: outage.timeOfIncident,
                                validTo: outage.restorationTime,
                                url: setOfWarnings.uri,
                                key: outage.latitude +'_' +outage.longitude
                            }

                            warnings[warning.key] = warning

                        } else {
                            console.log('Outage has no location information', outage)
                            // For now ignore it, we could do a postcode lookup and get a location that way
                        }
                    })
                })

                return warnings
            })
    }
}