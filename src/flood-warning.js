'use strict'

require('whatwg-fetch')
import lscache from 'lscache'


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
            if(floodPolygon) {
                this.inMemory[floodAreaID] = floodPolygon;
            } else {
                floodPolygon = this.inMemory[floodAreaID]
            }

            if(!floodPolygon) {


                let v = flood.floodArea.polygon
                console.log('looking for ' + floodAreaID , v)
                const floodPolyPromise = fetch(v)
                    .then(response => response.json())
                    .then(polygonData => {
                        console.log('got ', polygonData)
                        let geo = polygonData.features[0].geometry
                        if(geo.type === 'MultiPolygon') {
                            let floodPolygonsForAreaID = geo.coordinates[0].map((polygons, index) => {

                                return polygons.map((geoJSONCoords, index) => {
                                    return { lat: geoJSONCoords[1], lng: geoJSONCoords[0]}
                                })
                            })
                            console.log('cached as '+floodAreaID, floodPolygonsForAreaID)
                            lscache.set(floodAreaID, floodPolygonsForAreaID, 600)
                            this.inMemory[floodAreaID] = floodPolygonsForAreaID;
                            return floodPolygonsForAreaID
                        } else {
                            // Handle non MultiPolygon
                            throw new Error('unknown type of geojson data  for '+floodAreaID + geo.type)
                        }
                    })
                    .catch(err => console.error(err))

                floodAreaPromises.push(floodPolyPromise)
            } else {
                console.log('found in cache '+floodAreaID)
                floodAreaPromises.push(floodPolygon)
            }
        })

        return Promise.all(floodAreaPromises)

    }

    getWarning(location) {
        console.log('Get flood warnings for ', location)

        // TODO - change distance
        //return fetch('http://environment.data.gov.uk/flood-monitoring/id/floods?min-severity=3&lat='+location.location.lat+'&long='+location.location.lng+'&dist=600')
        return fetch('http://environment.data.gov.uk/flood-monitoring/id/floods?min-severity=3&lat='+location.location.lat+'&long='+location.location.lng+'&dist=600')
            .then(response => response.json())
            .then(floods => {
                console.log('fetched floods from API', floods)
                return this.getFloodAreaPolygons(floods)
                    .then((results) => {

                        console.log('processed the flood areas, do we still have floods in scope?', floods)


                        // Now process each into a warning
                        let warnings = []

                        //console.log('here comes the flood ',floods.items[0])

                        floods.items.forEach((flood, index) => {

                            /*
                             location: { lat: center.lat(), lng: center.lng()},
                             validFrom: warning.validFrom,
                             validTo: warning.validTo,
                             warningClass: warning.warningClass,
                             warningImpact: warning.warningImpact,
                             warningLevel: warning.warningLevel,
                             warningLikelihood: warning.warningLikelihood,
                             */

                            // TODO - use what we pass through in results rather than relookup from cache
                            let d = this.inMemory[flood.floodAreaID]

                            warnings.push({
                                text: flood.description,
                                detail: flood.message,
                                polygons: d,
                                type: 'flood',
                                key: flood.floodAreaID
                            })
                        })


                        return warnings
                    })
            })
    }
}