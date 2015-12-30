'use strict'

require('whatwg-fetch')
import lscache from 'lscache'

export default class PowerWarning {
    constructor() {
        lscache.setBucket('uk72')
        lscache.flushExpired()

        this.inMemory = {}
    }

    getWarning(location) {
        console.log('Get power warnings for ', location)


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
            .then(foo => {
                console.log('From power warnings',foo)
                // Convert to warnings format, cache etc

                let warnings = []
                return warnings
            })
    }
}