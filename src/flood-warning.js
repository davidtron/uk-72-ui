'use strict'

import defaultMember from 'whatwg-fetch'
import lscache from 'lscache'
import geolib from 'geolib'
import OSPoint from 'ospoint'


export default class FloodWarning {
    constructor() {
        lscache.setBucket('uk72')
        lscache.flushExpired()
    }

    static fetchFloodArea(floodUri) {

        console.log('looking for ', floodUri)
        return fetch(floodUri)
            .then(response => response.json())
            .then(polygonData => {
                let geo = polygonData.features[0].geometry
                if (geo.type === 'MultiPolygon') {
                    let floodPolygonsForAreaID = geo.coordinates[0].map((polygons, index) => {
                        return polygons.map((geoJSONCoords, index) => {
                            return {lat: geoJSONCoords[1], lng: geoJSONCoords[0]}
                        })
                    })
                    return floodPolygonsForAreaID
                } else {
                    // TODO Handle non MultiPolygon
                    throw new Error('unknown type of geojson data for geotype ' + geo.type + ' and uri ' +floodUri )
                }
            })
    }

    getFloods(location) {
        let floodWarnings = lscache.get('flood');
        if (floodWarnings) {
            console.log('fetched flood warnings from cache ', floodWarnings)
            return new Promise((resolve, reject) => resolve(floodWarnings))
        } else {
            // Retrieve all floods for the UK ( the API does support location and distance but choose to cache all for now
            return fetch('http://environment.data.gov.uk/flood-monitoring/id/floods?min-severity=3&lat=' + location.location.lat + '&long=' + location.location.lng + '&dist=1000')
                .then(response => response.json())
                .then(floods => {
                    if (floods.errorType) {
                        throw new Error('Could not process flood results:\n' + JSON.stringify(floods))
                    }
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

                let warnings = {}
                floods.items.forEach(flood => {

                    // Find midpoint of flood area
                    const lower = flood.floodArea.envelope.lowerCorner
                    const upper = flood.floodArea.envelope.upperCorner
                    const southWestCorner = new OSPoint(lower.ly, lower.lx).toWGS84()
                    const northEastCorner = new OSPoint(upper.uy, upper.ux).toWGS84()
                    const midpoint = geolib.getCenter([southWestCorner, northEastCorner])

                    const fetchPolygonData = function () {
                        return FloodWarning.fetchFloodArea(flood.floodArea.polygon)
                    }

                    const warning = {
                        text: flood.description,
                        detail: flood.message,
                        location: {lat: parseFloat(midpoint.latitude), lng: parseFloat(midpoint.longitude)},
                        bounds: {
                            sw: {lat: parseFloat(southWestCorner.latitude), lng: parseFloat(southWestCorner.longitude)},
                            ne: {lat: parseFloat(northEastCorner.latitude), lng: parseFloat(northEastCorner.longitude)}
                        },
                        polygonsFunction: fetchPolygonData,
                        type: 'flood',
                        key: flood.floodAreaID,
                        validFrom: flood.timeRaised,
                        validTo: null,
                        warningClass: flood.severity,
                        warningImpact: flood.severity,
                        warningLevel: flood.severityLevel,
                        warningLikelihood: flood.severity,
                    }

                    warnings[warning.key] = warning
                })

                return warnings;
            })
    }
}