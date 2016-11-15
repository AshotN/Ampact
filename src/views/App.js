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
import TopMessage from './components/topMessage'
import retry from 'async/retry';
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;
const shortcuts = require('../logic/Shortcuts');
const storage = require('electron-json-storage');

module.exports = class App extends Component {
	constructor (props) {
		super(props);

		this.state = {
			sidebarOpen: true,
			docked: true,
			transitions: false,
			connection: null,
			renderSongs: [],
			currentView: null, //Consider Removing
			playlists: new Map(),
			allSongs: [],
			soundHowl: null,
			isLoading: false,
			isPlaying: false,
			isPaused: false,
			isStopped: true,
			playingHowlID: -1,
			playerObject: null,
			loadingAmpacheSongId: -1,
			playingAmpacheSongId: -1,
			playingIndex: -1,
			volume: 0.5,
			topMessage: null,
			connectionAttempts: 0,
			FLAC: 0 //Can't wait for native FLAC support, firefox has it already!
		};

		this.volumeBarChangeEvent = this.volumeBarChangeEvent.bind(this);
		this.songSeekEvent = this.songSeekEvent.bind(this);
		this.playPauseSong = this.playPauseSong.bind(this);
		this.songIsOver = this.songIsOver.bind(this);
		this.playPreviousSong = this.playPreviousSong.bind(this);
		this.playSong = this.playSong.bind(this);
		this.favSong = this.favSong.bind(this);
		this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
		this.removeSongFromPlaylist = this.removeSongFromPlaylist.bind(this);
		this.renderAlbum = this.renderAlbum.bind(this);
		this.renderArtist = this.renderArtist.bind(this);


		retry({times: 3, interval: 200}, this.connect.bind(this), (err, result) => {
			console.log(err, result);
			if(err) {
				this.showNotificationTop("There was a problem connecting to the server");
				console.error("There was a problem connecting to the server", err);
			} else {
				retry({times: 3, interval: 2000}, this.renderSongs.bind(this), (err, result) => {
					if(err){
						this.showNotificationTop("There was a problem getting the songs");
						console.error("There was a problem getting the songs", err);
					}
				});

				retry({times: 3, interval: 2000}, this.loadAllPlaylists.bind(this), (err, result) => {
					if(err) {
						this.showNotificationTop("There was a problem getting the playlists");
						console.error("There was a problem getting the playlists", err);
					}
				});
			}
		});

		shortcuts({
			playPauseSong: this.playPauseSong
		});
	}


	openSettings (e) {
		var left = (screen.width/2);
		var top = (screen.height/2);

		let win = new BrowserWindow({width: 400, height: 500, x: left, y: top, frame: false, alwaysOnTop: true, resizable: false, show: false, backgroundColor: '#0E0E0E'});

		win.loadURL(`file://${__dirname}/../settings.html`);
		win.once('ready-to-show', () => {
			win.show();
		});
	}

	connect (cb) {
		// this.state.connection = new Ampache('hego555', 'vq7map509lz9', 'https://login.hego.co/index.php/apps/music/ampache');
		storage.has('ampact', (err, hasKey) => {
		  console.log(err, hasKey);
		  if(!hasKey){
			//TODO: Tell user to go setup server details
		  } else {
			storage.get('ampact', (err, data) => {
			  if(err) {
				//TODO: Proper error handling
			  }
			  this.state.connection = new Ampache(data.serverUsername, data.serverPassword, data.serverIP);

			  this.state.connection.handshake((err, result) => {
				if(err) {
				  return cb(err, result);
				}
				return cb(err, result);
			  });
			});
		  }
		});

	}

	renderSongs(cb){
		this.state.connection.getSongs((err, songs) => {
			if(err){
				return cb(err, null);
			}
			let theSongs = []; //Please make a better variable name...
			songs.forEach((song) => {
				theSongs[song.ID] = song;
			});

			this.setState({allSongs: theSongs}, () => {
				this.markFavorites((err, results) => {
					if(err){
						return cb(err, null);
					}
					this.setState({renderSongs: theSongs, currentView: -1});
				});
			});
		});
	}

	showNotificationTop (message, timeout = 5000) {
		this.setState({topMessage: message});

		setTimeout(() =>
		{
			this.setState({topMessage: null});
		}, timeout)
	}

	loadAllPlaylists (cb) {
		this.state.connection.getAllPlaylists((err, playlists) => {
			if(err){
				return cb(err, null);
			}
			console.log(err, playlists);
			let newPlaylists = this.state.playlists;
			playlists.forEach((playlist) => {
				console.log(playlist);
				newPlaylists.set(playlist.ID, playlist);
			});
			console.log(newPlaylists.length, newPlaylists);
			this.setState({playlists: newPlaylists});
			return cb(null, 'success');
		});
	}

	generatePlaylist (ampachePlaylistID, playlistName, cb) {
		this.state.connection.getPlaylistSongs(ampachePlaylistID, (err, songs) => {

			let updateAllSongs = this.state.allSongs;
			let newPlaylists = this.state.playlists;

			//Clear the playlist so we can re-render it
			newPlaylists.set(ampachePlaylistID, new Playlist(ampachePlaylistID, playlistName));

			songs.forEach((song) => {
				updateAllSongs[song.ID].PlaylistTrackNumber = song.PlaylistTrackNumber;

				newPlaylists.get(ampachePlaylistID).pushSingleSongID(song.ID);
			});

			this.setState({allSongs: updateAllSongs, playlists: newPlaylists}, () => {
				cb(null);
			});
		});
	}

	markFavorites (cb) {
		console.log("FAVVVV");
		this.state.connection.getPlaylistSongs(999, (err, songs) => {

			if(err){
				return cb(err, null);
			}

			let updateAllSongs = this.state.allSongs;

			songs.forEach((song) => {
				updateAllSongs[song.ID].Favorite = true;
				updateAllSongs[song.ID].PlaylistTrackNumber = song.PlaylistTrackNumber;

			});

			this.setState({allSongs: updateAllSongs}, () => {
				cb(null, 'success');
			});
		});
	}

	renderPlaylist (PlaylistID, cb) {
		let temp = this.state.allSongs;

		let renderReady = []; // Again needs a better variable name
		this.state.playlists.get(PlaylistID).Songs.forEach((song) => {
			console.log(song, temp[song]);
			renderReady.push(temp[song]);
		});
		console.log(renderReady);
		cb(null, renderReady);
	}

	renderAlbum (albumID) {
		this.state.connection.getSongsFromAlbum(albumID, (err, songs) => {
			this.setState({renderSongs: songs}, () => {

			});
		});
	}

	renderArtist (artistID) {
		this.state.connection.getSongsFromArtist(artistID, (err, songs) => {
			this.setState({renderSongs: songs}, () => {

			});
		});
	}

	renderFavPlaylist (cb) {
		let renderReady = []; // Again needs a better variable name
		let allSongs = this.state.allSongs;
		allSongs.forEach((song) => {
			if(song.Favorite) {
				renderReady.push(song);
			}
		});
		cb(null, renderReady);
	}

	songIsOver () {
		//Play the next song by order - A WIP
		this.playSongByPlayingIndex(this.state.playingIndex+1);
	}

	playPreviousSong () {
		//Play the previous song by order - A WIP
		this.playSongByPlayingIndex(this.state.playingIndex-1);
	}

	stopPlaying(cb) {
		if(this.state.isPlaying) {
			if(this.state.FLAC) {
				this.state.playerObject.stop();
				this.setState({
					isPlaying: false,
					isPaused: false,
					isStopped: true,
					playerObject: null,
					playingIndex: -1,
					playingAmpacheSongId: -1,
					FLAC: 0
				}, ()=> {
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
				}, ()=> {
					if (typeof cb === 'function') {
						cb();
					}
				});
			}
		}
		else {
			if(this.state.isLoading) {
				Howler.unload(); //TODO: If howler add's a stopAll Loading Global that would be better
			}
			cb();
		}
	}

	//**** you Javascript and your lack of overloading!
	playSongByPlayingIndex (playingIndex) {
		console.log("Play: "+playingIndex);
		let ourNewSong = this.state.renderSongs[playingIndex];
		if(ourNewSong === undefined) {
			return this.stopPlaying();
		}
		this.playSong(ourNewSong.ID, ourNewSong.URL, playingIndex)
	}

	favSong (e, AmpacheSongId) {
		console.log("Favorite Song", AmpacheSongId);

		if(e) {
			e.preventDefault(); // Let's stop this event.
			e.stopPropagation(); // Really this time.
		}

		if(this.state.allSongs[AmpacheSongId].Favorite == false) {
			let newAllSongs = this.state.allSongs;


			this.state.connection.addSongToPlaylist(999, AmpacheSongId, (err, cb) => {
				if(err){
					//TODO: error handling!
					return;
				}
				newAllSongs[AmpacheSongId].Favorite = true;

				this.setState({allSongs: newAllSongs});
			});

		}
		else {
			let newAllSongs = this.state.allSongs;

			this.state.connection.removeSongFromPlaylist(999, this.state.allSongs[AmpacheSongId].PlaylistTrackNumber, (err, cb) => {
				if(err){
					//TODO: error handling!
					return;
				}
				newAllSongs[AmpacheSongId].Favorite = false;

				this.setState({allSongs: newAllSongs});
			});
		}

	}

	playSong(AmpacheSongId, URL, playingIndex) {

		//Stop playing current songs and once that's done
		//setState that we are now loading a song and wait for the state to be set
		this.stopPlaying(() => {
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
					var sound = new Howl({
						src: [URL],
						format: ['mp3'],
						html5: true,
						volume: this.state.volume,
						onend: () => {
							console.log("OVER");
							this.songIsOver(e);
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


	playPauseSong () {
		if(this.state.isPlaying) {
			if(this.state.FLAC) {
				this.state.playerObject.pause();
			}
			else {
				this.state.soundHowl.pause(this.state.playingHowlID);
			}

			this.setState({isPlaying: false, isPaused: true, isStopped: false});

		}
		else if(this.state.isPaused) {
			if(this.state.FLAC) {
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

	volumeBarChangeEvent (value) {
		this.setState({volume: value});
		if(this.state.isPlaying) {
			if(this.state.FLAC) {
				this.state.playerObject.volume = value*100;
			}
			else {
				this.state.soundHowl.volume(value);
			}
		}
	}

	songSeekEvent (value) {
		console.log(value);
		if(this.state.isPlaying) {
			let duration = this.state.soundHowl.duration(this.state.playingHowlID);
			console.log(duration);
			this.state.soundHowl.seek(value * duration);
		}
	}

	home () {
		console.log(this.state.playlists);
		this.setState({renderSongs: this.state.allSongs, currentView: -1});
	}

	favorites () {
		this.renderFavPlaylist((err, renderOut) => {
			console.log(renderOut);
			this.setState({renderSongs: renderOut, currentView: 999});
		});
	}

	//Render the playlist
	playlist (playlistID, playlistName) {
		this.generatePlaylist(playlistID, playlistName, (err) => {
			this.renderPlaylist(playlistID, (err, cb) => {
				this.setState({renderSongs: cb, currentView: playlistID});
			});
		});
	}

	addSongToPlaylist (AmpacheSongID, Playlist) {
		console.log(`Add ${AmpacheSongID} To ${Playlist}`);
		this.state.connection.addSongToPlaylist(Playlist.ID, AmpacheSongID, (err, cb) => {
			if(err){
				//TODO: HANDLE ERRORS!
				console.log("ERROR!");
				return false;
			}
			this.state.playlists.get(Playlist.ID).pushSingleSongID(AmpacheSongID);;
			// this.playlist(Playlist.ID, Playlist.Name);
		});
	}

	removeSongFromPlaylist (Song, Playlist) {
		console.log(`Remove ${Song} From ${Playlist}`);
		this.state.connection.removeSongFromPlaylist(Playlist.ID, Song.PlaylistTrackNumber, (err, cb) => {
			if(err){
				//TODO: HANDLE ERRORS!
				console.log("ERROR!");
				return false;
			}
			this.playlist(Playlist.ID, Playlist.Name);
		});
	}

	render() {


		let playlists = [];
		this.state.playlists.forEach((value) => {
			playlists.push(<button key={value.ID}
								   onClick={(ID, Name) => this.playlist(value.ID, value.Name)}>{value.Name}-{value.ID}</button>);
		});

		let sidebarContent = <div>
			<div className='sidebarTitle'>Ampact - {this.state.currentView}</div>
			<div>
				<div className='defaultPlaylists'>
					<button onClick={(e) => this.home(e)}>Home</button>
					<button onClick={(e) => this.favorites(e)}>Favorites</button>
				</div>
				<div className='playlists'>
					<span className='title'>Playlists</span>
					{playlists}
				</div>
			</div>
			<div className='settings'>
				<div className='cogWrapper' onClick={(e) => this.openSettings(e)}>
					<img src='assets/images/settingsCog.png'/>
				</div>
			</div>
		</div>;

		let mainContent =
			<div className='wrapper'>


				<div className='headers'>
					<div className='song'>Song</div>
					<div className='artist'>Artist</div>
					<div className='album'>Album</div>
				</div>
				<div className='songs'>
					{this.state.renderSongs.map((object, i) => {
						return <SongRow key={i} Playlists={this.state.playlists} currentView={this.state.currentView}
										Index={i} Song={object} playingAmpacheSongId={this.state.playingAmpacheSongId}
										onPlaySong={this.playSong} onFavSong={this.favSong}
										onAddSongToPlaylist={this.addSongToPlaylist}
										onRemoveSongFromPlaylist={this.removeSongFromPlaylist}
										onRenderAlbum={this.renderAlbum}
										onRenderArtist={this.renderArtist}
										loadingAmpacheSongId={this.state.loadingAmpacheSongId}/>
					})}
				</div>

			</div>;

		return (
			<div>
				<div className='main'>
					<Sidebar sidebar={sidebarContent}
							 open={this.state.sidebarOpen}
							 docked={this.state.docked}
							 transitions={this.state.transitions}
							 sidebarClassName='sidebar'>
						<TopMessage Message={this.state.topMessage}/>
						{mainContent}
					</Sidebar>
				</div>
				{/*<div className="debug">Loading:{this.state.isLoading.toString()}:Paused:{this.state.isPaused.toString()}:Playing:{this.state.isPlaying.toString()}:Stopped:{this.state.isStopped.toString()}</div>*/}
				<Footer onPlayPauseSong={this.playPauseSong} onPreviousSong={this.playPreviousSong}
						onNextSong={this.songIsOver} onVolumeChange={this.volumeBarChangeEvent}
						onSeekChange={this.songSeekEvent} isStopped={this.state.isStopped}
						isPaused={this.state.isPaused} isLoading={this.state.isLoading} isPlaying={this.state.isPlaying}
						soundHowl={this.state.soundHowl} playingHowlID={this.state.playingHowlID}/>
			</div>

		);
	}
}
