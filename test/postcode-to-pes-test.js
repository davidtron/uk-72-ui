'use strict';

import test from 'tape';
import PostcodeToPes from '../src/postcode-to-pes.js'

const underTest = new PostcodeToPes()

test('Scottish Hydro (region 17)',  (assert) => {

    const testPostcodes = [
        'AB10','AB11', 'AB12', 'AB13', 'AB15', 'AB16',
        'AB1', 'AB2', 'AB3',
        'AB21', 'AB22', 'AB23', 'AB24', 'AB25',
        'AB30', 'AB31', 'AB32', 'AB33', 'AB34', 'AB35', 'AB36', 'AB37', 'AB38',
        'AB41', 'AB42', 'AB43', 'AB44', 'AB45',
        'AB51', 'AB52', 'AB53', 'AB54', 'AB55', 'AB56',
        'DD1', 'DD2', 'DD3', 'DD4', 'DD5', 'DD6', 'DD7', 'DD8', 'DD9', 'DD10','DD11',
        'FK15', 'FK16', 'FK17', 'FK18', 'FK19', 'FK20', 'FK21',
        'G83', 'G84',
        'HS1', 'HS2',
        'IV1', 'IV2', 'IV3', 'IV4', 'IV5', 'IV6', 'IV7', 'IV8', 'IV9', 'IV10', 'IV11', 'IV12', 'IV13', 'IV14', 'IV15', 'IV16', 'IV17', 'IV18', 'IV19', 'IV20', 'IV21', 'IV22', 'IV23', 'IV24', 'IV25', 'IV26', 'IV27', 'IV28',
        'IV30', 'IV31', 'IV32',
        'IV36',
        'IV40', 'IV41', 'IV42', 'IV43', 'IV44', 'IV45', 'IV46', 'IV47', 'IV48', 'IV49',
        'IV51', 'IV52', 'IV53', 'IV54', 'IV55', 'IV56',
        'KA27', 'KA28',
        'KW1', 'KW2', 'KW3',
        'KW5', 'KW6', 'KW7', 'KW8', 'KW9', 'KW10', 'KW11', 'KW12', 'KW13', 'KW14', 'KW15', 'KW16', 'KW17',
        'KY13',
        'PA20', 'PA21', 'PA22', 'PA23', 'PA24', 'PA25', 'PA26', 'PA27', 'PA28', 'PA29', 'PA30', 'PA31', 'PA32', 'PA33', 'PA34', 'PA35', 'PA36', 'PA37', 'PA38', 'PA39', 'PA40', 'PA41', 'PA42', 'PA43', 'PA44', 'PA45', 'PA46', 'PA47', 'PA48', 'PA49',
        'PA60', 'PA61', 'PA62', 'PA63', 'PA64', 'PA65', 'PA66', 'PA67', 'PA68', 'PA69', 'PA70', 'PA71', 'PA72', 'PA73', 'PA74', 'PA75', 'PA76', 'PA77', 'PA78',
        'PA80', 'PA81', 'PA82', 'PA83', 'PA84', 'PA85', 'PA86', 'PA87', 'PA88',
        'PH1', 'PH2', 'PH3', 'PH4', 'PH5', 'PH6', 'PH7', 'PH8', 'PH9', 'PH10', 'PH11', 'PH12', 'PH13', 'PH14', 'PH15', 'PH16', 'PH17', 'PH18', 'PH19', 'PH20', 'PH21', 'PH22', 'PH23', 'PH24', 'PH25', 'PH26',
        'PH30', 'PH31', 'PH32', 'PH33', 'PH34', 'PH35', 'PH36', 'PH37', 'PH38', 'PH39', 'PH40', 'PH41', 'PH42', 'PH43', 'PH44',
        'ZE1', 'ZE2', 'ZE3']

    testPostcodes.forEach(postcode => {
        assert.equal(17,underTest.lookupPes(postcode), postcode + ' should be in region 17')
    })

    assert.end();

})

test('Problem postcodes)', (assert) => {

    const testPostcodes = ['N8', 'KA8', 'KA9']

    testPostcodes.forEach(postcode => {
        assert.equal(-1,underTest.lookupPes(postcode), postcode + ' should be flagged as -1')
    })

    assert.end();

})