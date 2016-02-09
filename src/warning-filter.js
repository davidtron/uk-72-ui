'use strict'

import overlap from 'poly-overlap'


/**
 * Decide whether warnings should be shown.
 */
export default class WarningFilter {

    constructor() {
    }

    /**
     * Assumes that the returned function will be run against an Array of Warning's
     * @param currentBoundsAndZoom of the map
     * @returns {Function} A filter that checks bounding box of map against the polygon of the warning
     */
    selectVisibleWarnings(currentBoundsAndZoom) {
        // A filter that invokes _doBoundingBoxesIntersect for each warning passed in
        return function(warning) {
            return _warningsThatOverlapWithMap(currentBoundsAndZoom, warning)
        }
    }

    selectWarningsForMap(currentBoundsAndZoom, currentWarningKey) {
        return function(warning) {
            if(warning.key === currentWarningKey) return true

            if(warning.type === 'flood' && currentBoundsAndZoom.zoom > 10 && warning.warningLevel !== 'yellow') return true

            return false
        }
    }
}

const _warningsThatOverlapWithMap = function(currentBoundsAndZoom, warning) {
    const currentBounds = currentBoundsAndZoom.bounds

    if(_boundingBoxesIntersect(currentBounds, warning)) {

        // Check if the polygons really intersect if we have a polygon, and in the case of flood if we are zoom > 10
        const considerPolygon = warning.polygons && ( (warning.type === 'flood' && currentBoundsAndZoom.zoom > 10) || warning.type !== 'flood' )

        if(considerPolygon) {
            //console.log('checking polygon ' + warning.type + ' ' + currentBoundsAndZoom.zoom  )

            const viewPortCoords = [[currentBounds.ne.lat, currentBounds.ne.lng], [currentBounds.ne.lat, currentBounds.sw.lng], [currentBounds.sw.lat,currentBounds.sw.lng], [currentBounds.sw.lat, currentBounds.ne.lng]]

            // we want to return true for the first one we hit, so cant use for each
            for(let i=0; i < warning.polygons.length; i++) {
                const polygon = warning.polygons[i].map( (p) => {return [p.lat, p.lng]})
                const polygonsOverlap = overlap.overlap(polygon, viewPortCoords)
                if(polygonsOverlap) return true
            }
        } else {
            return true
        }
    }
    return false

}


/**
 * Fast check that bounding boxes intersect by comparing the corners.
 * @param currentBounds passed back from the react map component
 * @param warning
 * @returns {boolean} true if they intersect
 * @private
 */
const _boundingBoxesIntersect = function(currentBounds, warning) {
    // Check if bounding boxes intercept
    const warningBounds = warning.bounds

    const warningTopLeftX = warningBounds.sw.lng
    const warningTopLeftY = warningBounds.ne.lat
    const warningBottomRightX = warningBounds.ne.lng
    const warningBottomRightY = warningBounds.sw.lat

    const currentTopLeftX = currentBounds.sw.lng
    const currentTopLeftY = currentBounds.ne.lat
    const currentBottomRightX = currentBounds.ne.lng
    const currentBottomRightY = currentBounds.sw.lat

    const rabx = Math.abs(currentTopLeftX + currentBottomRightX - warningTopLeftX - warningBottomRightX)
    const raby = Math.abs(currentTopLeftY + currentBottomRightY - warningTopLeftY - warningBottomRightY)

    //rAx + rBx
    const raxPrbx = currentBottomRightX - currentTopLeftX + warningBottomRightX - warningTopLeftX

    //rAy + rBy
    const rayPrby = currentTopLeftY - currentBottomRightY + warningTopLeftY - warningBottomRightY

    if(rabx <= raxPrbx && raby <= rayPrby) {
        return true
    }
    return false
}
