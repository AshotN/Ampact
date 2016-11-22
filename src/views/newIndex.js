import React from 'react';
import Sidebar from 'react-sidebar'
import retry from 'async/retry';
const storage = require('electron-json-storage');
import {Ampache} from '../logic/Ampache'
import { Howl } from 'howler'

import Footer from './components/footer';
import SidebarContent from './components/SidebarContent'

export default class App extends React.Component {
  constructor(props) {
	super(props);

	this.state = {
	  sidebarOpen: true,
	  docked: true,
	  transitions: false,
	  allSongs: [],
	  allPlaylists: [],
	  soundHowl: null,
	  isLoading: false,
	  isPlaying: false,
	  isPaused: false,
	  isStopped: true,
	  volume: 0.5,
	  playingHowlID: -1,
	  playingIndex: -1,
	  playingAmpacheSongId: -1,
	  loadingAmpacheSongId: -1,
	  FLAC: 0
	};

	retry({times: 3, interval: 200}, this.connectToServer.bind(this), (err, result) => {
	  console.log(err, result);
	  if (err) {
		// this.showNotificationTop("There was a problem connecting to the server");
		console.error("There was a problem connecting to the server", err);
		return;
	  }
	  this.fetchPlaylists();
	  this.getAllSongs();
	});

	this.playSong = this.playSong.bind(this);
  }

  connectToServer(cb) {
	// this.state.connection = new Ampache('hego555', 'vq7map509lz9', 'https://login.hego.co/index.php/apps/music/ampache');
	storage.has('ampact', (err, hasKey) => {
	  console.log(err, hasKey);
	  if (!hasKey) {
		//TODO: Tell user to go setup server details
	  } else {
		storage.get('ampact', (err, data) => {
		  if (err) {
			//TODO: Proper error handling
		  }
		  let serverConnection = new Ampache(data.serverUsername, data.serverPassword, data.serverIP);

		  serverConnection.handshake((err, result) => {
			if (err) {
			  return cb(err, result);
			}
			this.setState({connection: serverConnection});
			return cb(null, result);
		  });
		});
	  }
	});

  }

  fetchPlaylists() {
	this.state.connection.getAllPlaylists((err, playlists) => {
	  console.log(err, playlists);
	  playlists.forEach((playlist) => {
		this.state.connection.getPlaylistSongs(playlist.ID, (err, songs) => {
		  //TODO: ERROR HANDLING
		  songs.forEach((song) => {
			playlist.pushSingleSongID(song.ID);
		  });
		});
	  });
	  console.log(playlists);
	  this.setState({allPlaylists: playlists});
	});
  }


  getAllSongs(cb) {
	this.state.connection.getSongs((err, songs) => {
	  if (err) {
		return cb(err, null);
	  }
	  let theSongs = [];
	  songs.forEach((song) => {
		theSongs[song.ID] = song;
	  });

	  this.setState({allSongs: theSongs});
	});
  }

  playSong(AmpacheSongId, URL, playingIndex) {

	//Stop playing current songs and once that's done
	//setState that we are now loading a song and wait for the state to be set
	this.stopPlaying((cb) => {
	  this.setState({
		isLoading: true,
		loadingAmpacheSongId: AmpacheSongId
	  }, () => {
		let re = /(?:\.([^.]+))?$/;

		let ext = re.exec(URL)[1];

		if (ext == 'flac') {
		  console.log("FLAC!!!");
		  var player = AV.Player.fromURL(URL);
		  player.preload();
		  player.volume = this.state.volume * 100;
		  player.on('end', () => {
			console.log("end");
			this.songIsOver();
		  });
		  player.on('buffer', (percent) => {
			console.log("Buffer: ", percent);
		  });
		  player.on('ready', () => {
			console.log("READY");
			player.play();
			this.setState({
			  isLoading: false,
			  isPlaying: true,
			  isPaused: false,
			  isStopped: false,
			  playingHowlID: -1,
			  playingIndex: playingIndex,
			  playerObject: player,
			  playingAmpacheSongId: parseInt(AmpacheSongId),
			  FLAC: 1
			});
		  });
		  player.on('error', (err) => {
			console.log("err", err)
		  });
		} else {
		  let sound = new Howl({
			src: [URL],
			format: ['mp3'],
			html5: true,
			volume: this.state.volume,
			onend: () => {
			  console.log("OVER");
			  this.songIsOver();
			},
			onload: () => {
			  console.log("Loaded", AmpacheSongId + ":" + this.state.loadingAmpacheSongId);
			  let howlID = sound.play();
			  this.setState({
				isLoading: false,
				isPlaying: true,
				isPaused: false,
				isStopped: false,
				playingHowlID: howlID,
				playingIndex: playingIndex,
				playingAmpacheSongId: parseInt(AmpacheSongId),
				loadingAmpacheSongId: -1,
				FLAC: 0,
				soundHowl: sound
			  });
			},
			onloaderror: () => {
			  console.log("onLoadError");
			  this.setState({
				isLoading: false,
				isPlaying: false,
				isPaused: false,
				isStopped: true,
				soundHowl: null,
				playingIndex: -1,
				playingAmpacheSongId: -1,
				loadingAmpacheSongId: -1,
				playingHowlID: -1
			  });
			  this.showNotificationTop(`Unable to Download Song, Are you Offline?`);
			  Howler.unload();

			}
		  });
		}
	  });
	});
  }

  stopPlaying(cb) {
	if (this.state.isPlaying) {
	  if (this.state.FLAC) {
		this.state.playerObject.stop();
		this.setState({
		  isPlaying: false,
		  isPaused: false,
		  isStopped: true,
		  playerObject: null,
		  playingIndex: -1,
		  playingAmpacheSongId: -1,
		  FLAC: 0
		}, () => {
		  if (typeof cb === 'function') {
			cb();
		  }
		});
	  }
	  else {
		this.state.soundHowl.stop();
		this.setState({
		  isLoading: false,
		  isPlaying: false,
		  isPaused: false,
		  isStopped: true,
		  soundHowl: null,
		  playingIndex: -1,
		  playingAmpacheSongId: -1,
		  playingHowlID: -1,
		}, () => {
		  if (typeof cb === 'function') {
			cb();
		  }
		});
	  }
	}
	else {
	  if (this.state.isLoading) {
		Howler.unload(); //TODO: If howler add's a stopAll Loading Global that would be better
	  }
	  cb();
	}
  }

  // passes the information down to its children
  getChildContext() {
	return {
	  allSongs: this.state.allSongs,
	  allPlaylists: this.state.allPlaylists,
	  onPlaySong: this.playSong
	};
  }


  render() {
	console.log("render", this.state.allPlaylists);
	return (
		<div>
		  <div className='dragBar'>
			<input onChange={this.searchBarHandleChange} onKeyPress={this.searchHandle} placeholder="Search..."
				   className='searchBar'/>
			<div onClick={this.closeApplication} className='closeApp'>
			  X
			</div>
		  </div>
		  <div className='main'>
			<Sidebar sidebar={<SidebarContent allPlaylists={this.state.allPlaylists}/>}
					 open={this.state.sidebarOpen}
					 docked={this.state.docked}
					 transitions={this.state.transitions}
					 sidebarClassName='sidebar'>
			  {/*<TopMessage Message={this.state.topMessage}/>*/}
			  { this.props.children }
			</Sidebar>
		  </div>
		  <Footer root={this.props.route.path}/>
		</div>
	);
  }
}
// make information available to its children
App.childContextTypes = {
  allSongs: React.PropTypes.array,
  allPlaylists: React.PropTypes.array,
  onPlaySong: React.PropTypes.func
};