'use strict'

import defaultMember from 'whatwg-fetch'
import lscache from 'lscache'
import geolib from 'geolib'
import OSPoint from 'ospoint'


export default class FloodWarning {
    constructor() {
        lscache.setBucket('uk72')
        lscache.flushExpired()
        this.inMemory = {}
    }

    getFloodAreaPolygons(floods) {

        let floodAreaPromises = []
        floods.items.forEach((flood, index) => {

            const floodAreaID = flood.floodAreaID;

            console.log('looking for ', floodAreaID)
            let floodPolygon = lscache.get(floodAreaID);
            if (floodPolygon) {
                this.inMemory[floodAreaID] = floodPolygon;
            } else {
                floodPolygon = this.inMemory[floodAreaID]
            }

            if (!floodPolygon) {


                let v = flood.floodArea.polygon
                console.log('looking for ' + floodAreaID, v)
                const floodPolyPromise = fetch(v)
                    .then(response => response.json())
                    .then(polygonData => {
                        console.log('got ', polygonData)
                        let geo = polygonData.features[0].geometry
                        if (geo.type === 'MultiPolygon') {
                            let floodPolygonsForAreaID = geo.coordinates[0].map((polygons, index) => {

                                return polygons.map((geoJSONCoords, index) => {
                                    return {lat: geoJSONCoords[1], lng: geoJSONCoords[0]}
                                })
                            })
                            console.log('cached as ' + floodAreaID, floodPolygonsForAreaID)
                            lscache.set(floodAreaID, floodPolygonsForAreaID, 600)
                            this.inMemory[floodAreaID] = floodPolygonsForAreaID;
                            return floodPolygonsForAreaID
                        } else {
                            // TODO Handle non MultiPolygon
                            throw new Error('unknown type of geojson data  for ' + floodAreaID + geo.type)
                        }
                    })
                    .catch(err => console.error(err))

                floodAreaPromises.push(floodPolyPromise)
            } else {
                console.log('found in cache ' + floodAreaID)
                floodAreaPromises.push(floodPolygon)
            }
        })

        return Promise.all(floodAreaPromises)
    }


    getFloods(location) {
        let floodWarnings = lscache.get('flood');
        if (floodWarnings) {
            console.log('fetched flood warnings from cache ', floodWarnings)
            return new Promise((resolve, reject) => resolve(floodWarnings))
        } else {
            // Retrieve all floods for the UK ( the API does support location and distance but choose to cache all for now
            return fetch('http://environment.data.gov.uk/flood-monitoring/id/floods?min-severity=3&lat='+location.location.lat+'&long='+location.location.lng+'&dist=1000')
                .then(response => response.json())
                .then(floods => {
                    console.log('fetched flood warnings from API ', floods)
                    lscache.set('flood', floods, 240)
                    return floods;
                })
        }
    }

    getWarning(location) {
        console.log('Get flood warnings for ', location)

        return this.getFloods(location)
            .then(floods => {

                let warnings = []
                floods.items.forEach(flood => {

                    // Find midpoint of flood area
                    const lower = flood.floodArea.envelope.lowerCorner
                    const upper = flood.floodArea.envelope.upperCorner
                    const low = new OSPoint(lower.ly, lower.lx).toWGS84()
                    const up = new OSPoint(upper.uy, upper.ux).toWGS84()

                    const midpoint = geolib.getCenter([low, up])


                    // TODO - create a bounding box for the flood and a link that allows us to download and cache the
                    // polygon data when requested.


                    warnings.push({
                        text: flood.description,
                        detail: flood.message,
                        location: {lat: parseInt(midpoint.latitude), lng: parseInt(midpoint.longitude)},

                        type: 'flood',
                        key: flood.floodAreaID,
                        validFrom: flood.timeRaised,
                        validTo: null,
                        warningClass: flood.severity,
                        warningImpact: flood.severity,
                        warningLevel: flood.severityLevel,
                        warningLikelihood: flood.severity,
                    })
                })

                return warnings;
            })
    }
}