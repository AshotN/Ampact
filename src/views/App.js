import { Component } from 'react'
import Sidebar from 'react-sidebar'
import { Ampache } from '../logic/Ampache'
import { Song } from '../logic/Song'
import { Playlist } from '../logic/Playlist'
import { Howl } from 'howler'
import Footer from './components/footer'
import classNames from 'classnames';


module.exports = class App extends Component {
	constructor (props) {
		super(props)

		this.state = {
			sidebarOpen: true,
			docked: true,
			transitions: false,
			connection: null,
			renderSongs: [],
			playlists: new Map(),
			allSongs: [],
			soundHowl: null,
			isPlaying: false,
			isPaused: false,
			isStopped: true,
			playingHowlID: -1,
			playingAmpacheSongId: -1,
			playingIndex: -1,
			volume: 0.5
		}

		this.volumeBarChangeEvent = this.volumeBarChangeEvent.bind(this);
		this.playPauseSong = this.playPauseSong.bind(this);
		this.songIsOver = this.songIsOver.bind(this);
		this.playPreviousSong = this.playPreviousSong.bind(this);


		this.connect();
	}

	openSettings (e) {
		console.log('I should really make this');//TODO: Figure this out!
	}

	connect () {
		// this.state.connection = new Ampache('hego555', 'vq7map509lz9', 'https://login.hego.co/index.php/apps/music/ampache');
		this.state.connection = new Ampache('admin', 'password', 'https://ampache.hego.co');

		this.state.connection.handshake((err, result) => {
			if(err) {
				//handle error
			}
			else {
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
							this.setState({renderSongs: theSongs});
						});
					});
				});
				this.loadAllPlaylists();
			}
		});
	}

	loadAllPlaylists () {
		console.log("load");
		this.state.connection.getAllPlaylists((err, playlists) => {
			console.log(err, playlists);
			let newPlaylists = this.state.playlists;
			playlists.forEach((playlist) => {
				console.log(playlist);
				newPlaylists.set(playlist.Name, playlist);
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
			newPlaylists.set(playlistName, new Playlist(ampachePlaylistID, playlistName));

			songs.forEach((song) => {
				updateAllSongs[song.ID].PlaylistTrackNumber = song.PlaylistTrackNumber;

				newPlaylists.get(playlistName).pushSingleSongID(song.ID);
			});


			this.setState({allSongs: updateAllSongs, playlists: newPlaylists}, () => {
				cb(null);
			});
		});		
	}

	generateFavorits (cb) {
		this.state.connection.getPlaylistSongs(1, (err, songs) => {

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

	renderPlaylist (PlaylistName, cb) {
		let temp = this.state.allSongs;

		let renderReady = []; // Again needs a better variable name
		this.state.playlists.get(PlaylistName).Songs.forEach((song) => {
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

	songIsOver (e) {
		//Play the next song by order - A WIP
		this.playSongByPlayingIndex(this.state.playingIndex+1);
	}

	playPreviousSong () {
		//Play the previous song by order - A WIP
		this.playSongByPlayingIndex(this.state.playingIndex-1);
	}

	stopPlaying(){
		if(this.state.isStopped == false) {
			this.state.soundHowl.stop();
			this.setState({isPlaying: false, isPaused: false, isStopped: true, playingHowlID: -1, playingIndex: -1, playingAmpacheSongId: -1});				
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

	addSongToFavoriteByAmpacheSongId (AmpacheSongId) {
		this.state.connection.addSongToPlaylist(1, AmpacheSongId, (err, cb) => {
			console.log(cb);
		});
	}

	removeSongFromFavorite (TrackNumber) {
		this.state.connection.removeSongFromPlaylist(1, TrackNumber, (err, cb) => {
			console.log(cb);
		});
	}

	favSong (e, AmpacheSongId) {
		console.log("Favorite Song", AmpacheSongId);
		e.preventDefault(); // Let's stop this event.
		e.stopPropagation(); // Really this time.

		if(this.state.allSongs[AmpacheSongId].Favorite == false) {
			let newAllSongs = this.state.allSongs;

			this.addSongToFavoriteByAmpacheSongId(AmpacheSongId);
			newAllSongs[AmpacheSongId].Favorite = true;

			this.setState({allSongs: newAllSongs});
		}
		else{
			let newAllSongs = this.state.allSongs;

			this.removeSongFromFavorite(this.state.allSongs[AmpacheSongId].PlaylistTrackNumber);
			newAllSongs[AmpacheSongId].Favorite = false;

			this.setState({allSongs: newAllSongs});
		}

	}

	playSong (AmpacheSongId, URL, playingIndex) {
		console.log(playingIndex, URL);
		var sound = new Howl({
			src: [URL],
			format: ['mp3'],
			html5: true,
			volume: this.state.volume,
			onend: (e) => { this.songIsOver(e); },
			onplay: (e) => { console.log('play'); }
		});

		if(this.state.isPlaying) {
			this.state.soundHowl.stop();
			// this.setState({isPlaying: false, isPaused: false, isStopped: true});
		}

		this.state.soundHowl = sound;
		let howlID = this.state.soundHowl.play();

		this.setState({isPlaying: true, isPaused: false, isStopped: false, playingHowlID: howlID, playingIndex: playingIndex, playingAmpacheSongId: AmpacheSongId});
	}


	playPauseSong (e) {
		if(this.state.isPlaying){
			this.state.soundHowl.pause(this.state.playingHowlID);

			this.setState({isPlaying: false, isPaused: true, isStopped: false});

		}
		else if(this.state.isPaused) {
			this.state.soundHowl.volume(this.state.volume);
			let id = this.state.soundHowl.play(this.state.playingHowlID);
			console.log("resume: "+id);
			this.setState({isPlaying: true, isPaused: false, isStopped: false});
		}
	}

	 
	volumeBarChangeEvent (value) {
		console.log("Recieved Volume: "+value);
		this.setState({volume: value});
		if(this.state.isPlaying) {
			this.state.soundHowl.volume(value);
		}
		// Howl.volume(value);
	}

	home () {
		console.log(this.state.playlists);
		this.setState({renderSongs: this.state.allSongs});
	}

	favorites () {
		this.renderFavPlaylist((err, renderOut) => {
			console.log(renderOut);
			this.setState({renderSongs: renderOut});
		});
	}

	playlist (playlistID, playlistName) {
		this.generatePlaylist(playlistID, playlistName, (err) => {
			this.renderPlaylist(playlistName, (err, cb) => {
				console.log(cb);
				this.setState({renderSongs: cb});	
			});
		});	
	}

	render () {

	let playlists = [];
	this.state.playlists.forEach((value, key) => {
		playlists.push(<button key={value.ID} onClick={(ID, Name) => this.playlist(value.ID, value.Name)}>{value.Name}</button>);
	});

		console.log(this.state.playlists.length, this.state.playlists);

		let sidebarContent = <div>
			<div className='sidebarTitle'>Ampact</div>
			<div>
				<button onClick={(e) => this.home(e)}>Home</button>
				<button onClick={(e) => this.favorites(e)}>Favorites</button>
				<div>
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
						console.log(object, i);
						let songClasses = classNames('song', {'playingNow': object.ID === this.state.playingAmpacheSongId});
						let favoriteIconClasses = classNames('favSong', {'favorited': object.Favorite});
						return (
							<div onClick={(AmpacheSongId, url, playingIndex) => this.playSong(object.ID, object.URL, i)}
								className={songClasses} key={i}>
									<div className={favoriteIconClasses} onClick={(e, AmpacheSongId) => this.favSong(e, object.ID)}></div>
									<div>{object.Title}</div>
									<div>{object.Artist}</div>
									<div>{object.Album}</div>
							</div>
						);
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
					{mainContent}
				</Sidebar>
			 </div>
			<Footer onPlayPauseSong={this.playPauseSong} onPreviousSong={this.playPreviousSong} onNextSong={this.songIsOver} onChange={this.volumeBarChangeEvent} isPlaying={this.state.isPlaying} />
			</div>

		);
	}
}
