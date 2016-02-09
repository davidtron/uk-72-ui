'use strict';


import test from 'tape'
import WarningFilter from '../src/warning-filter'

const underTest = new WarningFilter()
const currentWarningKey = 'expected key'

const withinBounds = {
    bounds: {
        sw : {lat: 51.66828345676973, lng: -0.40566998265444454},
        ne : {lat: 51.67094504554497, lng: -0.39736586354433710}
    }
}


const withinPolygon =[[{lat:51.66975899288566,lng:-0.40013657437597683},{lat:51.66975899288566,lng:-0.40086079297149624},{lat:51.669309835243595,lng:-0.40086079297149624},{lat:51.669309835243595,lng:-0.40013657437597683}]]
const notWithinPolygon =[[{lat:0,lng:1},{lat:0.2,lng:1},{lat:0.2,lng:1.2},{lat:0,lng:1.2}]]

test('selectWarningsForMap include currently selected warning', (assert) => {

    const allWarnings = [
        { key: currentWarningKey},
        { key: 'not currently selected'}
    ]

    const results = allWarnings.filter(underTest.selectWarningsForMap(null, currentWarningKey))

    assert.equal(results.length, 1)
    assert.equal(results[0].key, 'expected key')
    assert.end();

})


test('selectWarningsForMap does not include warnings that are not flood and not currently selected', (assert) => {

    const allWarnings = [
        { type: 'other type'}
    ]

    const results = allWarnings.filter(underTest.selectWarningsForMap(null, currentWarningKey))

    assert.equal(results.length, 0)
    assert.end();

})

test('selectWarningsForMap include warning if flood, zoom is greater than 10, and level is not yellow', (assert) => {

    const allWarnings = [
        { type: 'flood', warningLevel: 'amber', key: 'not currently selected'}
    ]
    const boundsAndZoom = { zoom: 11 }

    const results = allWarnings.filter(underTest.selectWarningsForMap(boundsAndZoom, currentWarningKey))

    assert.equal(results.length, 1)
    assert.equal(results[0].key, 'not currently selected')
    assert.end();
})

test('selectWarningsForMap does not include warning if flood but zoom is less than or equal to 10 and level is not yellow', (assert) => {

    const allWarnings = [
        { type: 'flood', warningLevel: 'amber', key: 'not currently selected'}
    ]
    const boundsAndZoom = { zoom: 10 }

    const results = allWarnings.filter(underTest.selectWarningsForMap(boundsAndZoom, currentWarningKey))

    assert.equal(results.length, 0)
    assert.end();
})

test('selectWarningsForMap does not include warning if flood zoom is greater than 10, but level is yellow', (assert) => {

    const allWarnings = [
        { type: 'flood', warningLevel: 'yellow', key: 'not currently selected'}
    ]
    const boundsAndZoom = { zoom: 10 }

    const results = allWarnings.filter(underTest.selectWarningsForMap(boundsAndZoom, currentWarningKey))

    assert.equal(results.length, 0)
    assert.end();
})


test('selectVisibleWarnings bounding boxes dont intersect', (assert) => {
    const allWarnings = [
        {
            type: 'flood',
            key: 'something',
            bounds: {
                sw : {lat: 54.598, lng: -3.15},
                ne : {lat: 54.602, lng: -3.14}
            }
        }
    ]

    const boundsAndZoom = {
        bounds: {
            sw : {lat: 52.598, lng: -2.15},
            ne : {lat: 51.602, lng: -2.14}
        }
    }

    const results = allWarnings.filter(underTest.selectVisibleWarnings(boundsAndZoom))
    assert.equal(results.length, 0)
    assert.end();

})



test('selectVisibleWarnings within bounding box, no polygon, dont consider polygon', (assert) => {
    const allWarnings = [
        {
            key: 'something',
            bounds: {
                sw : {lat: 51.66863609878051, lng: -0.4019471208648644},
                ne : {lat: 51.67043272934875, lng: -0.39905024648260873}
            }
        }
    ]

    const results = allWarnings.filter(underTest.selectVisibleWarnings(withinBounds))
    assert.equal(results.length, 1)
    assert.end();

})

test('selectVisibleWarnings within bounding box, not of type flood, consider polygon', (assert) => {
    const allWarnings = [
        {
            type: 'power cut',
            key: 'something',
            bounds: {
                sw : {lat: 51.66863609878051, lng: -0.4019471208648644},
                ne : {lat: 51.67043272934875, lng: -0.39905024648260873}
            },
            polygons: withinPolygon
        }
    ]

    const results = allWarnings.filter(underTest.selectVisibleWarnings(withinBounds))
    assert.equal(results.length, 1)
    assert.end();
})

test('selectVisibleWarnings within bounding box, of type flood, zoom is below 10, dont consider polygon', (assert) => {
    const allWarnings = [
        {
            type: 'flood',
            key: 'something',
            bounds: {
                sw : {lat: 51.66863609878051, lng: -0.4019471208648644},
                ne : {lat: 51.67043272934875, lng: -0.39905024648260873}
            },
            polygons: notWithinPolygon
        }
    ]

    /**
     * Polygon is not within the same area as the bounds so if the polygon is considered there should be no results
     */
    const withinBoundsWithZoom = withinBounds
    withinBoundsWithZoom.zoom = 8

    const results = allWarnings.filter(underTest.selectVisibleWarnings(withinBoundsWithZoom))
    assert.equal(results.length, 1)
    assert.end();
})

test('selectVisibleWarnings within bounding box, of type flood, zoom is above 10, consider polygon', (assert) => {
    const allWarnings = [
        {
            type: 'flood',
            key: 'something',
            bounds: {
                sw : {lat: 51.66863609878051, lng: -0.4019471208648644},
                ne : {lat: 51.67043272934875, lng: -0.39905024648260873}
            },
            polygons: notWithinPolygon
        }
    ]

    /**
     * Polygon is not within the same area as the bounds so if the polygon is considered there should be no results
     */
    const withinBoundsWithZoom = withinBounds
    withinBoundsWithZoom.zoom = 11

    const results = allWarnings.filter(underTest.selectVisibleWarnings(withinBoundsWithZoom))
    assert.equal(results.length, 0)
    assert.end();
})

