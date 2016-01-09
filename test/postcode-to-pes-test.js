'use strict';

import test from 'tape';
import PostcodeToPes from '../src/postcode-to-pes.js'

const underTest = new PostcodeToPes()

test('Multiple providers in area', (assert) => {
    const postcode = 'SK17 0LF'
    assert.equal(underTest.lookupPes(postcode), '11,16',  postcode + ' should 11,16')
    assert.end();
})

test('Unknown postcode', (assert) => {
    const postcode = 'XXX XXX'
    assert.equal(underTest.lookupPes(postcode), '24',  postcode + ' should 24')
    assert.end();
})


test('Postcode with 2 networks owned by same operator just returns one operator', (assert) => {
    const postcode = 'WD23 1BH'
    assert.equal(underTest.lookupPes(postcode), '10',  postcode + ' should 10')
    assert.end();
})

test('DNO 10', (assert) => {
    const postcode = 'AL1 1SQ'
    assert.equal(underTest.lookupPes(postcode), '10', postcode + ' should 10')
    assert.end();
})

test('DNO 11', (assert) => {
    const postcode = 'DE1 1LP'
    assert.equal(underTest.lookupPes(postcode), '11', postcode + ' should 11')
    assert.end();
})

test('DNO 12', (assert) => {
    const postcode = 'CM12 0TX'
    assert.equal(underTest.lookupPes(postcode), '12',  postcode + ' should 12')
    assert.end();
})

test('DNO 13', (assert) => {
    const postcode = 'CF3 0HR'
    assert.equal(underTest.lookupPes(postcode), '13',  postcode + ' should 13')
    assert.end();
})

test('DNO 14', (assert) => {
    const postcode = 'B17 8BJ'
    assert.equal(underTest.lookupPes(postcode), '14',  postcode + ' should 14')
    assert.end();
})

test('DNO 15', (assert) => {
    const postcode = 'BD7 2HX'
    assert.equal(underTest.lookupPes(postcode), '15',  postcode + ' should 15')
    assert.end();
})

test('DNO 16', (assert) => {
    const postcode = 'BB4 6SJ'
    assert.equal(underTest.lookupPes(postcode), '16',  postcode + ' should 16')
    assert.end();
})

test('DNO 17', (assert) => {
    const postcode = 'FK10 1EH'
    assert.equal(underTest.lookupPes(postcode), '17',  postcode + ' should 17')
    assert.end();
})

test('DNO 18', (assert) => {
    const postcode = 'DG9 9PJ'
    assert.equal(underTest.lookupPes(postcode), '18',  postcode + ' should 18')
    assert.end();
})

test('DNO 19', (assert) => {
    const postcode = 'BN1 3JB'
    assert.equal(underTest.lookupPes(postcode), '19',  postcode + ' should 19')
    assert.end();
})

test('DNO 20', (assert) => {
    const postcode = 'RG40 4HX'
    assert.equal(underTest.lookupPes(postcode), '20',  postcode + ' should 20')
    assert.end();
})

test('DNO 21', (assert) => {
    const postcode = 'LD6 5NP'
    assert.equal(underTest.lookupPes(postcode), '21',  postcode + ' should 21')
    assert.end();
})

test('DNO 22', (assert) => {
    const postcode = 'PL4 8NH'
    assert.equal(underTest.lookupPes(postcode), '22',  postcode + ' should 22')
    assert.end();
})

test('DNO 23', (assert) => {
    const postcode = 'NE61 1PB'
    assert.equal(underTest.lookupPes(postcode), '23',  postcode + ' should 23')
    assert.end();
})

test('Invalid postcode', (assert) => {
    assert.throws(() => underTest.lookupPes('invalid-postcode'), 'should throw error')
    assert.end();
})