'use strict'

import React from 'react'
// import only the render function of react-dom using ES2015 destructuring
import { render } from 'react-dom'
import WarningBox from './warning-box.js'

require('../style/app.css');

render(
    <WarningBox />,
    document.getElementById('app')
)