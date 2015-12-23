'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var $ = require('jquery');
var foundation = require('foundation');

$(document).foundation();

var CommentBox = require('./example.js');
var Foo = require('./foo.js');

var SimpleMapPage = require('./google-test.jsx');





ReactDOM.render(
    <CommentBox url="/comments" />,
    document.getElementById('content')
);

ReactDOM.render(
    <SimpleMapPage />,
    document.getElementById('map')
);