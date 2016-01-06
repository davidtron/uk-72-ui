'use strict'

require('whatwg-fetch')
import lscache from 'lscache'

export default class PowerWarning {
    constructor() {
        lscache.setBucket('uk72')
        lscache.flushExpired()

        this.inMemory = {}
    }

    getPowerData(location) {

        // Ideally we separate out the lookup of postcode to provider - ideally dont in memory not on lambda
        // Any provider that we retrieve all outages from can then be cached

        let powerWarnings = lscache.get('power'+location);
        if(powerWarnings) {
            console.log('fetched power warnings from cache', powerWarnings)
            return new Promise((resolve, reject) => resolve(powerWarnings))
        } else {
            return fetch('https://3tvc4lnrvi.execute-api.eu-west-1.amazonaws.com/development/power/warnings', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    postcode: location.postcode
                })
            })
                .then(response => response.json())
                .then(power => {
                    console.log('fetched power warnings from API', power)
                    lscache.set('power'+location, power, 30) // cache for 30mins
                    return power
                })
        }
    }

    getWarning(location) {
        console.log('Get power warnings for ', location)

        return this.getPowerData(location)
            .then(foo => {
                console.log('From power warnings',foo)
                // TODO - filter the warnings based on location


                let warnings = []
                return warnings
            })
    }
}