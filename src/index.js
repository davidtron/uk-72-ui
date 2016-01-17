'use strict'

import React from 'react'
import { render } from 'react-dom'
import WarningBox from './warning-box.js'

require('../style/app.css');

render(
    <WarningBox />,
    document.getElementById('app')
)