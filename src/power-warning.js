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

                            const polygonBounds = geolib.getBoundsOfDistance(outage, 25)

                            // bounds[0] is southwest corner
                            const polygon = [
                                {lat: polygonBounds[1].latitude, lng: polygonBounds[1].longitude},
                                {lat: polygonBounds[1].latitude, lng: polygonBounds[0].longitude},
                                {lat: polygonBounds[0].latitude, lng: polygonBounds[0].longitude},
                                {lat: polygonBounds[0].latitude, lng: polygonBounds[1].longitude}
                            ]

                            const mapBounds = geolib.getBoundsOfDistance(outage, 100)


                            const bounds = {
                                sw: { lat: mapBounds[0].latitude, lng: mapBounds[0].longitude },
                                ne: { lat: mapBounds[1].latitude, lng: mapBounds[1].longitude }
                            }

                            const warning = {
                                text: 'Power cut. Be prepared',
                                area: outage.postCode.join(', '),
                                detail: outage.info,
                                location: {lat: outage.latitude, lng: outage.longitude},
                                polygons: [polygon],
                                bounds: bounds,
                                type: 'power cut',
                                validFrom: outage.timeOfIncident,
                                validTo: outage.restorationTime,
                                warningLevel: 'amber',
                                phone: this.findContactDetails(setOfWarnings.network),
                                url: [{href: '../prepared/#powercut-slider', name: 'Get Advice'}, {href: setOfWarnings.uri, name: setOfWarnings.network}],
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

    findContactDetails(network) {

        const mapping = {
            'UK Power Networks' : ['0800 31­63 105'],
            'Western Power' : ['0800 6783 105'],
            'SP Energy Networks' : ['Central & Southern Scotland: 0800 092 9290', 'Cheshire, Merseyside, North Wales & North Shropshire: 0800 001 5400'],
            'Northern Power Grid' : ['North east: 0800 66 88 77', 'Yorkshire & North Lincs: 0800 375 675'],
            'Scottish and Southern Energy' : ['Central southern England: 0800 072 7282', 'North of Scotland: 0800 300 999'],
            'Electricity North West' : ['0800 195 4141'],
            'GTC' : ['0800 0326 990']
        }
        return mapping[network]
    }
}