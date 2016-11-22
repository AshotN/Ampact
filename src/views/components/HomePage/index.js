import {Component} from 'react'
const storage = require('electron-json-storage');
const remote = require('electron').remote;
import SongRow from '../SongRow'

module.exports = class SettingsView extends Component {

  constructor(props) {
	super(props);

  }

  render() {
	return (
		<div>
		  <span>Home</span>
		</div>
	);
  }
}
