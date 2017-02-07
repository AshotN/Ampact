import React from 'react';
import Sidebar from 'react-sidebar';
import retry from 'async/retry';
import storage from 'electron-json-storage';
import {Ampache} from '../../logic/Ampache';
import {Howl} from 'howler';
import _ from 'lodash'

const remote = require('electron').remote;

import Footer from '../../components/Footer';
import SidebarContent from '../../components/SidebarContent';
import TopMessage from '../../components/topMessage';
const shortcuts = require('../../logic/Shortcuts');

import renderIf from '../../assets/scripts/renderif'

export default class App extends React.Component {
  constructor(props) {
	super(props);

	this.state = {
	  sidebarOpen: true,
	  docked: true,
	  transitions: false,
	  connection: null,
	  allPlaylists: new Map(),
	  albumsForHome: new Map(),
	  soundHowl: null,
	  isLoading: false,
	  isPlaying: false,
	  isPaused: false,
	  isStopped: true,
	  volume: 0.5,
	  playingHowlID: -1,
	  playingIndex: -1,
	  playingSongDuration: -1,
	  loadingAmpacheSongId: -1,
	  playingAmpacheSongId: -1,
	  FLAC: 0,
	  searchValue: null,
	  topMessage: null,
	  noCredentials: false
	};

	this.volumeBarChangeEvent = this.volumeBarChangeEvent.bind(this);
	this.songSeekEvent = this.songSeekEvent.bind(this);
	this.playPauseSong = this.playPauseSong.bind(this);
	this.playNextSong = this.playNextSong.bind(this);
	this.playPreviousSong = this.playPreviousSong.bind(this);
	this.playSong = this.playSong.bind(this);
	this.searchBarHandleChange = this.searchBarHandleChange.bind(this);
	this.searchHandle = this.searchHandle.bind(this);

	shortcuts({
	  playPauseSong: this.playPauseSong
	});

	retry({times: 3, interval: 200}, this.connectToServer.bind(this), (err, authKey) => {
	  if (err) {
		this.showNotificationTop("There was a problem connecting to the server");
		console.error("There was a problem connecting to the server", err);
		return;
	  }
	  retry({times: 3, interval: 200}, this.getAllPlaylists.bind(this), (err, allPlaylists) => {
		if (err) {
		  this.showNotificationTop("There was a problem fetching the playlists");
		  console.error("There was a problem fetching the playlists", err);
		  return;
		}
		this.setState({allPlaylists: allPlaylists});
		retry({times: 3, interval: 200}, this.getAllAlbums.bind(this), (err, allAlbums) => {
		  if (err) {
			this.showNotificationTop("There was a problem fetching the albums");
			console.error("There was a problem fetching the albums", err);
			return;
		  }
		  let randomAlbums = new Map();
		  let uniqueNums = [];
		  let randomNum;
		  for (let i = 0; i < 5; i++) {
			do
			  randomNum = ~~((Math.random() * allAlbums.size) + 1);
			while (uniqueNums.indexOf(randomNum) !== -1);

			uniqueNums.push(randomNum);
			randomAlbums.set(i, allAlbums.get(randomNum));
		  }
		  this.setState({albumsForHome: randomAlbums});
		});
		retry({times: 3, interval: 200}, this.state.connection.getAllSongs, (err, Songs) => {
		  if (err) {
			this.showNotificationTop("There was a problem fetching the songs");
			console.error("There was a problem fetching the songs", err);
			return;
		  }
		  this.setState({allSongs: Songs})
		});
	  });
	});

	this.playSong = this.playSong.bind(this);
  }

  showNotificationTop(message, timeout = 5000) {
	this.setState({topMessage: message});

	setTimeout(() => {
	  this.setState({topMessage: null});
	}, timeout)
  }

  /**
   * @callback connectToServerCallback
   * @param {null|string} errorCode - The code returned by the Ampache server
   * @param {string|null} authKey - Key used for all future interactions with the API
   */
   /**
   * Creates a connection to the server
   * @param {connectToServerCallback} cb - The callback that handles the response.
   * */
  connectToServer(cb) {
	// this.state.connection = new Ampache('hego555', 'vq7map509lz9', 'https://login.hego.co/index.php/apps/music/ampache');
	storage.has('ampact', (err, hasKey) => {
	  if (!hasKey) {
		this.setState({noCredentials: true});
	  } else {
		storage.get('ampact', (err, data) => {
		  if (err) {
			return cb(err, null);
		  }
		  let serverConnection = new Ampache(data.serverUsername, data.serverPassword, data.serverIP);

		  serverConnection.handshake((err, authKey) => {
			if (err) {
			  return cb(err, null);
			}
			this.setState({connection: serverConnection}, () => {
			  return cb(null, authKey);
			});
		  });
		});
	  }
	});

  }

  getAllPlaylists(cb) {
    this.state.connection.getAllPlaylists((err, allPlaylists) => {
	  if (err) {
		return cb(err, null);
	  }
	  return cb(null, allPlaylists);
	});
  }

  /**
   * @callback getAllAlbumsCallback
   * @param {null|string} Error
   * @param {null|Map.Album} allAlbums
   */
  /**
   * Get all Albums
   * @param {getAllAlbumsCallback} cb - The callback that handles the response.
   * */
  getAllAlbums(cb) {
	this.state.connection.getAllAlbums((err, allAlbums) => {
	  if (err) {
		return cb(err, null);
	  }
	  return cb(null, allAlbums);
	});
  }

  playPauseSong() {
	if (this.state.isPlaying) {
	  if (this.state.FLAC) {
		this.state.playerObject.pause();
	  }
	  else {
		this.state.soundHowl.pause(this.state.playingHowlID);
	  }

	  this.setState({isPlaying: false, isPaused: true, isStopped: false});

	}
	else if (this.state.isPaused) {
	  if (this.state.FLAC) {
		this.state.playerObject.volume = this.state.volume * 100;
		this.state.playerObject.play();

	  }
	  else {
		this.state.soundHowl.volume(this.state.volume);
		this.state.soundHowl.play(this.state.playingHowlID);
	  }

	  this.setState({isPlaying: true, isPaused: false, isStopped: false});
	}
  }

  /**
   * Play the specified song
   * @param {Number} AmpacheSongID
   * @param {Number} playingIndex
   * */
  playSong(AmpacheSongID, playingIndex) {

    AmpacheSongID = parseInt(AmpacheSongID);
	let URL = this.state.allSongs.get(AmpacheSongID).URL;

	//Stop playing current songs and once that's done
	//setState that we are now loading a song and wait for the state to be set
	this.stopPlaying((cb) => {
	  this.setState({
		isLoading: true,
		loadingAmpacheSongId: AmpacheSongID
	  }, () => {
		let re = /(?:\.([^.]+))?$/;

		let ext = re.exec(URL)[1];

		if (ext == 'flac') {
		  var player = AV.Player.fromURL(URL);
		  player.preload();
		  player.volume = this.state.volume * 100;
		  player.on('end', () => {
			this.songIsOver();
		  });
		  player.on('buffer', (percent) => {
		  });
		  player.on('ready', () => {
			player.play();
			this.setState({
			  isLoading: false,
			  isPlaying: true,
			  isPaused: false,
			  isStopped: false,
			  playingHowlID: -1,
			  playingIndex: playingIndex,
			  playerObject: player,
			  playingAmpacheSongId: parseInt(AmpacheSongID),
			  FLAC: 1
			});
		  });
		  player.on('error', (err) => {
		  });
		} else {
		  let sound = new Howl({
			src: [URL],
			format: ['mp3'],
			html5: true,
			volume: this.state.volume,
			onend: () => {
			  this.songIsOver();
			},
			onload: () => {
			  let howlID = sound.play();
			  this.setState({
				isLoading: false,
				isPlaying: true,
				isPaused: false,
				isStopped: false,
				playingHowlID: howlID,
				playingIndex: playingIndex,
				playingAmpacheSongId: parseInt(AmpacheSongID),
				loadingAmpacheSongId: -1,
				FLAC: 0,
				soundHowl: sound,
				playingSongDuration: sound.duration(howlID) * 1000
			  });
			},
			onloaderror: () => {
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

  //**** you Javascript and your lack of overloading!
  playSongByPlayingIndex(playingIndex) {
	let ourNewSong = this.state.allSongs.get(playingIndex);
	if (ourNewSong === undefined) {
	  return this.stopPlaying();
	}
	this.playSong(ourNewSong.ID, playingIndex)
  }

  songIsOver (e) {
	//Play the next song by order - A WIP
	this.playSongByPlayingIndex(this.state.playingIndex+1);
  }

  stopPlaying(cb) {
    console.log("Stop");
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
	  if (typeof cb === 'function') {
		cb();
	  }
	}
  }

  playNextSong() {
	//Play the next song by order - A WIP
	this.playSongByPlayingIndex(this.state.playingIndex + 1);
  }

  playPreviousSong() {
	//Play the previous song by order - A WIP
	this.playSongByPlayingIndex(this.state.playingIndex - 1);
  }

  volumeBarChangeEvent(value) {
	this.setState({volume: value});
	if (this.state.isPlaying) {
	  if (this.state.FLAC) {
		this.state.playerObject.volume = value * 100;
	  }
	  else {
		this.state.soundHowl.volume(value);
	  }
	}
  }

  songSeekEvent(value) {
	if (!this.state.isStopped) {
	  let duration = this.state.soundHowl.duration(this.state.playingHowlID);
	  this.state.soundHowl.seek(value * duration);
	}
  }

  closeApplication() {
	remote.getCurrentWindow().close();
  }

  searchBarHandleChange(event) {
	this.setState({'searchValue': event.target.value});
  }

  searchHandle(event) {
	if (event.key == 'Enter') {
	  //TODO: Make a search page view
	}
  }

  render() {
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
			  <TopMessage Message={this.state.topMessage}/>
			  {
				renderIf(!this.state.noCredentials)(
					this.props.children && React.cloneElement(this.props.children, {
					  allSongs: this.state.allSongs,
					  allPlaylists: this.state.allPlaylists,
					  albumsForHome: this.state.albumsForHome,
					  allAlbums: this.state.allAlbums,
					  onPlaySong: this.playSong,
					  playingAmpacheSongId: this.state.playingAmpacheSongId,
					  loadingAmpacheSongId: this.state.loadingAmpacheSongId,
					  onAddSongToPlaylist: this.addSongToPlaylist,
					  onRemoveSongFromPlaylist: this.removeSongFromPlaylist,
					  updatePlaylist: this.updatePlaylist,
					  connection: this.state.connection
					}))}
			  {renderIf(this.state.noCredentials)(
			  	<div className='keyContainer'>
				  <img src='assets/images/key.png' />
				</div>
			  )}
			</Sidebar>
		  </div>
		  <Footer root={this.props.route.path} onPlayPauseSong={this.playPauseSong}
				  onPreviousSong={this.playPreviousSong}
				  onNextSong={this.playNextSong}
				  songDuration={this.state.playingSongDuration}
				  onVolumeChange={this.volumeBarChangeEvent}
				  onSeekChange={this.songSeekEvent} isStopped={this.state.isStopped}
				  isPaused={this.state.isPaused} isLoading={this.state.isLoading} isPlaying={this.state.isPlaying}/>
		</div>
	);
  }
}

App.contextTypes = {
  router: React.PropTypes.object.isRequired
};