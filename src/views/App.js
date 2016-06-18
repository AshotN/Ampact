import { Component } from 'react'
import Sidebar from 'react-sidebar'
import { Ampache } from '../logic/Ampache'
import { Song } from '../logic/Song'
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
			playlists: [],
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
					let allSongs = [];
					songs.forEach((song) => {
						console.log(song);
						allSongs[song.ID] = song;
					});
					this.setState({renderSongs: allSongs});

					this.state.connection.getPlaylistSongs(1, (err, songs) => {
						
						let allFavSongs = [];
						songs.forEach((song) => {
							console.log(song);
							song.Favorite = true;
							allSongs[song.ID].PlaylistTrackNumber = song.PlaylistTrackNumber;
							allFavSongs[song.ID] = allSongs[song.ID];
						});

						let newPlaylists = this.state.playlists;    
						newPlaylists['home'] = allSongs;
						newPlaylists['favorites'] = allFavSongs;
						this.setState({playlists: newPlaylists}, () => {
							this.markAllFavorites();
						});					
					});


				});
			}
		});
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

	checkIfFavoriteByAmpacheSongId (AmpacheSongID) {
		this.playlist['favorites'].forEach((song) => {
			if(song.ID == AmpacheSongID){
				return true;
			}
		});
		return false;
	}

	markAllFavorites () {
		this.state.connection.getPlaylistSongs(1, (err, songs) => {

			let newPlaylists = this.state.playlists;   
			songs.forEach((song) => {
				console.log("A", song);
				newPlaylists['home'][song.ID].Favorite = true;
			});
 
			this.setState({playlists: newPlaylists});
		});		
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

		if(this.state.playlists['home'][AmpacheSongId].Favorite == false) {
			this.addSongToFavoriteByAmpacheSongId(AmpacheSongId);
		}
		else{
			this.removeSongFromFavorite(this.state.playlists['home'][AmpacheSongId].PlaylistTrackNumber);
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
		this.setState({renderSongs: this.state.playlists['home']});
	}

	playlist () {
		 // this.getFavoritePlaylist(() => {
			this.setState({renderSongs: this.state.playlists['favorites']});
		 // });
	}

	render () {
		const sidebarContent = <div>
			<div className='sidebarTitle'>Ampact</div>
			<div>
				<button onClick={(e) => this.home(e)}>Home</button>
				<button onClick={(e) => this.playlist(e)}>Playlist</button>
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
						)
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
