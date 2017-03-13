'use strict';

require('babel-register');

var React = require('react');
var render = require('react-dom').render;
var SettingsView = require('./views/Settings/');

render(
	React.createElement(SettingsView),
	document.getElementById('root')
);