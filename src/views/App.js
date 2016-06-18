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
			playingAmpacheID: -1,
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
						allSongs.push(song);
					});
					this.setState({renderSongs: allSongs});

					let newPlaylists = this.state.playlists.slice();    
					newPlaylists['home'] = allSongs;
					this.setState({playlists: newPlaylists});					

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
			this.setState({isPlaying: false, isPaused: false, isStopped: true, playingHowlID: -1, playingIndex: -1, playingAmpacheID: -1});				
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

	getFavoritePlaylist (cb) {
		this.state.connection.getPlaylistSongs(1, (err, songs) => {
			let allSongs = [];
			songs.forEach((song) => {
				console.log(song);
				allSongs.push(song);
			});

			let newPlaylists = this.state.playlists;    
			newPlaylists['favorites'] = allSongs;
			this.setState({playlists: newPlaylists}, (err, done) => {
				console.log(err, done);
				cb();
			});		
		});
	}

	addSongToFavoriteByAmpacheID (AmpacheID) {
		this.state.connection.getSong(AmpacheID, (err, song) => {
			let newPlaylists = this.state.playlists;
			newPlaylists['favorites'].push(song);
			this.setState({playlists: newPlaylists});
		});
	}

	favSong (e, AmpacheID) {
		console.log("Favorite Song", AmpacheID);
		e.preventDefault(); // Let's stop this event.
		e.stopPropagation(); // Really this time.

		this.addSongToFavoriteByAmpacheID(AmpacheID);

	}

	playSong (AmpacheID, URL, playingIndex) {
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

		this.setState({isPlaying: true, isPaused: false, isStopped: false, playingHowlID: howlID, playingIndex: playingIndex, playingAmpacheID: AmpacheID});
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
		this.getFavoritePlaylist(() => {
			this.setState({renderSongs: this.state.playlists['favorites']});
		});
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
						let classes = classNames('song', {'playingNow': object.ID === this.state.playingAmpacheID});
						return (
							<div onClick={(AmpacheID, url, playingIndex) => this.playSong(object.ID, object.URL, i)}
								className={classes} key={i}>
									<div className='favSong' onClick={(e, AmpacheID) => this.favSong(e, object.ID)}></div>
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
