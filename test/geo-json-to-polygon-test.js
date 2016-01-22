'use strict';


import test from 'tape'
import GeoJSON from '../src/geo-json-to-polygon'

// This is inlined by brfs in the test module
const fs = require('fs')
const retrievedPolygonData = JSON.parse(fs.readFileSync(__dirname + '/resources/flood-polygon-data.json', 'utf8'))

test('parse polygon data into array of coords', (assert) => {

    const polygonsFromGeoJSON = new GeoJSON(retrievedPolygonData)
    assert.notEqual(polygonsFromGeoJSON.type, 'Error')
    assert.equal(polygonsFromGeoJSON.length, 1)

    const points = polygonsFromGeoJSON[0][0]
    assert.equal(points.length, 84)
    assert.end();

})

