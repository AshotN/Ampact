import { Component } from 'react'
import Sidebar from 'react-sidebar'
import { Ampache } from '../logic/Ampache'
import { Song } from '../logic/Song'
import { SongRender } from '../logic/SongRender'
import { Playlist } from '../logic/Playlist'
import Footer from './components/footer'
// import sidebarContent from './components/SidebarContent'
import classNames from 'classnames';
import SongRow from './components/SongRow'
import TopMessage from './components/topMessage'
const remote = require('electron').remote;
const BrowserWindow = remote.BrowserWindow;
const shortcuts = require('../logic/Shortcuts');

module.exports = class App extends Component {
	constructor (props) {
		super(props);

		this.state = {
			sidebarOpen: true,
			docked: true,
			transitions: false,
			connection: null,
			renderSongs: [],
			currentView: null,
			playlists: new Map(),
			allSongs: [],
			isPlaying: false,
			isPaused: false,
			isStopped: true,
			playerObject: null,
			playingAmpacheSongId: -1,
			playingIndex: -1,
			volume: 50,
			topMessage: null,
			connectionAttempts: 0
		};

		this.volumeBarChangeEvent = this.volumeBarChangeEvent.bind(this);
		this.playPauseSong = this.playPauseSong.bind(this);
		this.songIsOver = this.songIsOver.bind(this);
		this.playPreviousSong = this.playPreviousSong.bind(this);
		this.playSong = this.playSong.bind(this);
		this.favSong = this.favSong.bind(this);
		this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
		this.removeSongFromPlaylist = this.removeSongFromPlaylist.bind(this);


		this.connect();
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

	connect () {

		// this.state.connection = new Ampache('hego555', 'vq7map509lz9', 'https://login.hego.co/index.php/apps/music/ampache');
		this.state.connection = new Ampache('admin', 'password', 'http://localhost/ampache');

		this.state.connection.handshake((err, result) => {
			if(err) {
				if(err == 404)
				{
					this.showNotificationTop(`Unable To Connect To Server...Retrying(${this.state.connectionAttempts})`);
					setTimeout(() =>
					{
						this.setState({connectionAttempts: this.state.connectionAttempts + 1}, () => {
							//Recursion is fun
							this.connect();
						});
					}, 10000)
				}
			}
			else {
				this.setState({connectionAttempts: 0});
				console.log(result);
				this.state.connection.getSongs((err, songs) => {
					let theSongs = []; //Please make a better variable name...
					songs.forEach((song) => {
						// console.log(song);
						theSongs[song.ID] = song;
					});

					this.setState({allSongs: theSongs}, () => {
						console.log("AAYYYY");
						this.generateFavorits((cb) => {
							console.log("OHHHHHH");
							this.setState({renderSongs: theSongs, currentView: -1});
						});
					});
				});
				this.loadAllPlaylists();
			}
		});
	}

	showNotificationTop (message) {
		this.setState({topMessage: message});

		setTimeout(() =>
		{
			this.setState({topMessage: null});
		}, 5000)
	}

	loadAllPlaylists () {
		console.log("load");
		this.state.connection.getAllPlaylists((err, playlists) => {
			console.log(err, playlists);
			let newPlaylists = this.state.playlists;
			playlists.forEach((playlist) => {
				console.log(playlist);
				newPlaylists.set(playlist.ID, playlist);
			});
			console.log(newPlaylists.length, newPlaylists);
			this.setState({playlists: newPlaylists});
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

	generateFavorits (cb) {
		console.log("FAVVVV");
		this.state.connection.getPlaylistSongs(999, (err, songs) => {

			console.log(431, err);

			let updateAllSongs = this.state.allSongs;

			songs.forEach((song) => {
				updateAllSongs[song.ID].Favorite = true;
				updateAllSongs[song.ID].PlaylistTrackNumber = song.PlaylistTrackNumber;

			});

			let newPlaylists = this.state.playlists || []; 

			this.setState({allSongs: updateAllSongs}, () => {
				cb();
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

	stopPlaying(){
		if(this.state.isStopped == false) {
			this.state.playerObject.stop();
			this.setState({isPlaying: false, isPaused: false, isStopped: true, playerObject: null, playingIndex: -1, playingAmpacheSongId: -1});
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
					//TODO: rror handling!
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
					//TODO: rror handling!
					return;
				}
				newAllSongs[AmpacheSongId].Favorite = false;

				this.setState({allSongs: newAllSongs});
			});
		}

	}

	playSong (AmpacheSongId, URL, playingIndex) {
		console.log(playingIndex, URL);
		var player = AV.Player.fromURL(URL);
		player.volume = this.state.volume;
		player.on('end', () => {
			console.log("end");
			this.songIsOver();
		});
		if(this.state.isPlaying) {
			this.state.playerObject.stop();
		}


		player.play();
		this.setState({isPlaying: true, isPaused: false, isStopped: false, playingIndex: playingIndex, playerObject: player, playingAmpacheSongId: parseInt(AmpacheSongId)});
	}


	playPauseSong () {
		if(this.state.isPlaying){
			this.state.playerObject.pause();

			this.setState({isPlaying: false, isPaused: true, isStopped: false});

		}
		else if(this.state.isPaused) {
			this.state.playerObject.volume = this.state.volume;
			this.state.playerObject.play();
			this.setState({isPlaying: true, isPaused: false, isStopped: false});
		}
	}

	 
	volumeBarChangeEvent (value) {
		console.log("Recieved Volume: "+value);
		this.setState({volume: value});
		if(this.state.isPlaying) {
			this.state.playerObject.volume = value;
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
	render () {


	let playlists = [];
	this.state.playlists.forEach((value) => {
		console.log(value.ID, value.Name);
		playlists.push(<button key={value.ID} onClick={(ID, Name) => this.playlist(value.ID, value.Name)}>{value.Name}-{value.ID}</button>);
	});

		console.log(this.state.playlists.length, this.state.playlists);

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
					<img src='assets/images/settingsCog.png' />
				</div>
			</div>
		</div>

		let mainContent = 
			<div className='wrapper'>


				<div className='headers'>
					<div>Song</div>
					<div>Artist</div>
					<div>Album</div>
				</div>
				<div className='songs'>
					{this.state.renderSongs.map((object, i) => {
						return <SongRow key={i} Playlists={this.state.playlists} currentView={this.state.currentView} Index={i} Song={object} playingAmpacheSongId={this.state.playingAmpacheSongId} onPlaySong={this.playSong} onFavSong={this.favSong} onAddSongToPlaylist={this.addSongToPlaylist} onRemoveSongFromPlaylist={this.removeSongFromPlaylist} />
					})}
				</div>

			</div>

		return (
			<div>
			 <div className='main'>
				<Sidebar sidebar={sidebarContent}
				 open={this.state.sidebarOpen}
				 docked={this.state.docked}
				 transitions={this.state.transitions}
				 sidebarClassName='sidebar'>
					<TopMessage Message={this.state.topMessage} />
					{mainContent}
				</Sidebar>
			 </div>
			<Footer onPlayPauseSong={this.playPauseSong} onPreviousSong={this.playPreviousSong} onNextSong={this.songIsOver} onChange={this.volumeBarChangeEvent} isPlaying={this.state.isPlaying} />
			</div>

		);
	}
}
