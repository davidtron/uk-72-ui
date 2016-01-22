'use strict'

/**
 * Cut down version of https://github.com/charlienewey/geojson-google-maps/
 */
export default class GeoJSON {

    constructor(geojson) {
        let obj
        switch (geojson.type) {

            case "FeatureCollection":
                if (!geojson.features) {
                    obj = _error("Invalid GeoJSON object: FeatureCollection object missing \"features\" member.")
                } else {
                    obj = []
                    for (let i = 0; i < geojson.features.length; i++) {
                        obj.push(_geometryToGoogleMaps(geojson.features[i].geometry))
                    }
                }
                break

            case "GeometryCollection":
                if (!geojson.geometries) {
                    obj = _error("Invalid GeoJSON object: GeometryCollection object missing \"geometries\" member.")
                } else {
                    obj = []
                    for (let i = 0; i < geojson.geometries.length; i++) {
                        obj.push(_geometryToGoogleMaps(geojson.geometries[i]))
                    }
                }
                break

            case "Feature":
                if (!(geojson.properties && geojson.geometry)) {
                    obj = _error("Invalid GeoJSON object: Feature object missing \"properties\" or \"geometry\" member.")
                } else {
                    obj = _geometryToGoogleMaps(geojson.geometry)
                }
                break

            case "Polygon":
            case "MultiPolygon":
                if (geojson.coordinates) {
                    obj = _geometryToGoogleMaps(geojson)
                } else {
                    obj = _error("Invalid GeoJSON object: Geometry object missing \"coordinates\" member.")
                }

                break

            default:
                obj = _error("Invalid GeoJSON object: GeoJSON object must be one of \"Polygon\", \"MultiPolygon\".")
        }
        return obj
    }
}

const _error = function (message) {
    return {
        type: "Error",
        message: message
    }
}

const _ccw = function (path) {
    let isCCW
    let a = 0

    for (let i = 0; i < path.length - 2; i++) {
        a += ((path[i + 1].lat - path[i].lat) * (path[i + 2].lng - path[i].lng) - (path[i + 2].lat - path[i].lat) * (path[i + 1].lng - path[i].lng))
    }
    if (a > 0) {
        isCCW = true
    }
    else {
        isCCW = false
    }
    return isCCW
}

var _geometryToGoogleMaps = function (geojsonGeometry) {
    let path, ll
    let exteriorDirection
    let interiorDirection
    let googleObj

    switch (geojsonGeometry.type) {

        case "Polygon":
            var paths = []
            for (let i = 0; i < geojsonGeometry.coordinates.length; i++) {
                path = []
                for (let j = 0; j < geojsonGeometry.coordinates[i].length; j++) {
                    ll = { lat: geojsonGeometry.coordinates[i][j][1], lng: geojsonGeometry.coordinates[i][j][0]}
                    path.push(ll)
                }

                if (!i) {
                    exteriorDirection = _ccw(path)
                    paths.push(path)
                } else if (i === 1) {
                    interiorDirection = _ccw(path)
                    if (exteriorDirection === interiorDirection) {
                        paths.push(path.reverse())
                    } else {
                        paths.push(path)
                    }
                } else {
                    if (exteriorDirection === interiorDirection) {
                        paths.push(path.reverse())
                    } else {
                        paths.push(path)
                    }
                }
            }

            googleObj = paths

            break

        case "MultiPolygon":
            googleObj = [];
            for (let i = 0; i < geojsonGeometry.coordinates.length; i++) {
                paths = []
                for (let j = 0; j < geojsonGeometry.coordinates[i].length; j++) {
                    path = []
                    for (let k = 0; k < geojsonGeometry.coordinates[i][j].length; k++) {
                        ll = { lat: geojsonGeometry.coordinates[i][j][k][1], lng: geojsonGeometry.coordinates[i][j][k][0]}
                        path.push(ll)
                    }
                    if (!j) {
                        exteriorDirection = _ccw(path)
                        paths.push(path)
                    } else if (j === 1) {
                        interiorDirection = _ccw(path)
                        if (exteriorDirection === interiorDirection) {
                            paths.push(path.reverse())
                        } else {
                            paths.push(path)
                        }
                    } else {
                        if (exteriorDirection === interiorDirection) {
                            paths.push(path.reverse())
                        } else {
                            paths.push(path)
                        }
                    }
                }
                googleObj = paths
            }

            break;

        default:
            googleObj = _error("Invalid GeoJSON object: Geometry object must be one of \"Point\", \"LineString\", \"Polygon\" or \"MultiPolygon\".");
    }
    return googleObj;
}
