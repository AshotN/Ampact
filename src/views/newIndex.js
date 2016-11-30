import React from 'react';
import Sidebar from 'react-sidebar'
import retry from 'async/retry';
const storage = require('electron-json-storage');
import {Ampache} from '../logic/Ampache'
import {Howl} from 'howler'

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
	  playingSongDuration: -1,
	  loadingAmpacheSongId: -1,
	  playingAmpacheSongId: -1,
	  FLAC: 0,
	  searchValue: null
	};

	this.volumeBarChangeEvent = this.volumeBarChangeEvent.bind(this);
	this.songSeekEvent = this.songSeekEvent.bind(this);
	this.playPauseSong = this.playPauseSong.bind(this);
	this.playNextSong = this.playNextSong.bind(this);
	this.playPreviousSong = this.playPreviousSong.bind(this);
	this.playSong = this.playSong.bind(this);
	this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
	this.removeSongFromPlaylist = this.removeSongFromPlaylist.bind(this);
	this.searchBarHandleChange = this.searchBarHandleChange.bind(this);
	this.searchHandle = this.searchHandle.bind(this);

	retry({times: 3, interval: 200}, this.connectToServer.bind(this), (err, result) => {
	  console.log(err, result);
	  if (err) {
		this.showNotificationTop("There was a problem connecting to the server");
		console.error("There was a problem connecting to the server", err);
		return;
	  }
	  retry({times: 3, interval: 200}, this.fetchPlaylists.bind(this), (err, result) => {
		if (err) {
		  this.showNotificationTop("There was a problem fetching the playlists");
		  console.error("There was a problem fetching the playlists", err);
		  return;
		}
		retry({times: 3, interval: 200}, this.getAllSongs.bind(this), (err, result) => {
		  if (err) {
			this.showNotificationTop("There was a problem fetching the songs");
			console.error("There was a problem fetching the songs", err);
			return;
		  }
		});
	  });
	});

	this.playSong = this.playSong.bind(this);
  }

  showNotificationTop (message, timeout = 5000) {
	this.setState({topMessage: message});

	setTimeout(() =>
	{
	  this.setState({topMessage: null});
	}, timeout)
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
			return cb(err, result);
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

  fetchPlaylists(cb) {
	this.state.connection.getAllPlaylists((err, playlists) => {
	  console.log(err, playlists);
	  playlists.forEach((playlist) => {
		this.state.connection.getPlaylistSongs(playlist.ID, (err, songs) => {
		  if (err) {
			return cb(err, result);
		  }
		  songs.forEach((song) => {
			playlist.pushSingleSongID(song.ID);
		  });
		});
	  });
	  console.log(playlists);
	  this.setState({allPlaylists: playlists});
	  return cb(null, 'success');
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
				soundHowl: sound,
				playingSongDuration: sound.duration(howlID) * 1000
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

  //**** you Javascript and your lack of overloading!
  playSongByPlayingIndex (playingIndex) {
	console.log("Play: "+playingIndex);
	let ourNewSong = this.state.allSongs[playingIndex];
	if(ourNewSong === undefined) {
	  return this.stopPlaying();
	}
	this.playSong(ourNewSong.ID, ourNewSong.URL, playingIndex)
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

  addSongToPlaylist(AmpacheSongID, Playlist) {
	console.log(`Add ${AmpacheSongID} To ${Playlist}`);
	this.state.connection.addSongToPlaylist(Playlist.ID, AmpacheSongID, (err, cb) => {
	  if (err) {
		//TODO: HANDLE ERRORS!
		return false;
	  }
	  this.state.playlists.get(Playlist.ID).pushSingleSongID(AmpacheSongID);
	});
  }

  removeSongFromPlaylist(Song, Playlist) {
	console.log(`Remove ${Song} From ${Playlist}`);
	this.state.connection.removeSongFromPlaylist(Playlist.ID, Song.PlaylistTrackNumber, (err, cb) => {
	  if (err) {
		//TODO: HANDLE ERRORS!
		return false;
	  }
	  this.playlist(Playlist.ID, Playlist.Name);
	});
  }

  searchBarHandleChange(event) {
	this.setState({ 'searchValue': event.target.value });
  }

  searchHandle(event) {
	if(event.key == 'Enter') {
	  //TODO: Make a search page view
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
// make information available to its children
App.childContextTypes = {
  allSongs: React.PropTypes.array,
  allPlaylists: React.PropTypes.array,
  onPlaySong: React.PropTypes.func
};