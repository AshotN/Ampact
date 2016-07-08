import { Component } from 'react'
import Sidebar from 'react-sidebar'
import { Ampache } from '../logic/Ampache'
import { Song } from '../logic/Song'
import { SongRender } from '../logic/SongRender'
import { Playlist } from '../logic/Playlist'
import { Howl } from 'howler'
import Footer from './components/footer'
// import sidebarContent from './components/SidebarContent'
import classNames from 'classnames';
import SongRow from './components/SongRow'
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;

module.exports = class SettingsView extends Component {
	constructor (props) {
		super(props)

		this.state = {

		}

	}

	render () {
		return (
			<div className='settingsPage'>
				<div className='SettingsTitle'>
					<span>Settings</span>
				</div>
				<div className='fields'>
					<div className='field'>
						<label htmlFor='serverIP'>Server IP</label>
						<input type='textbox' id='serverIP' />
					</div>
					<div className='field'>
						<label htmlFor='serverUsername'>Server Username</label>
						<input type='textbox' id='serverUsername' />
					</div>
					<div className='field'>
						<label htmlFor='serverPassword'>Server Password</label>
						<input type='textbox' id='serverPassword' />
					</div>
					<div className='field'>
						<button>Save</button>
					</div>
				</div>
			</div>
		);
	}
}
