import { Component } from 'react'
import Sidebar from 'react-sidebar'
import { Ampache } from '../logic/Ampache'
import { Howl } from 'howler'
import Footer from './components/footer'

module.exports = class App extends Component {
	constructor (props) {
		super(props)

		this.state = {
			sidebarOpen: true,
			docked: true,
			transitions: false,
			connection: null,
			songs: [],
			soundHowl: null,
			isPlaying: false,
			isPaused: false,
			isStopped: true,
			playingId: 0,
			playingIndex: 0,
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
		// this.connection = new Ampache('hego555', 'vq7map509lz9', 'https://login.hego.co/index.php/apps/music/ampache');
		this.connection = new Ampache('admin', 'password', 'https://ampache.hego.co');

		this.connection.handshake((err, result) => {
			if(err) {
				//handle error
			}
			else {
				this.connection.getSongs((err, songs) => {
					songs.forEach((song) => {
						console.log(song);
						var nextState = this.state.songs;
						nextState.push(song);
						this.setState(nextState);
					});
				});
			}
		});
	}

	songIsOver (e) {
		//Play the next song by order
		this.playSongByPlayingIndex(this.state.playingIndex+1);
	}

	playPreviousSong () {
		//Play the previous song by order
		this.playSongByPlayingIndex(this.state.playingIndex-1);
	}

	stopPlaying(){
		if(this.state.isStopped == false) {
			this.state.soundHowl.stop();
			this.setState({isPlaying: false, isPaused: false, isStopped: true, playingId: 0});				
		}
	}

	//**** you Javascript and your lack of overloading!
	playSongByPlayingIndex (playingIndex) {
		console.log("Play: "+playingIndex);
		let ourNewSong = this.state.songs[playingIndex];
		if(ourNewSong === undefined) {
			return this.stopPlaying();
		}
		this.playSong(ourNewSong.ID, ourNewSong.URL, playingIndex)
	}

	playSong (ID, URL, playingIndex) {
		console.log(playingIndex, URL);
		var sound = new Howl({
			src: [URL],
			format: ['mp3'],
			html5: true,
			volume: this.state.volume,
			onend: (e) => { this.songIsOver(e); },
			onplay: (e) => { console.log('play');}
		});

		if(this.state.isPlaying) {
			this.state.soundHowl.stop();
			this.setState({isPlaying: false, isPaused: false, isStopped: true});
		}

		this.state.soundHowl = sound;
		let id = this.state.soundHowl.play();

		this.setState({isPlaying: true, isPaused: false, isStopped: false, playingId: id, playingIndex: playingIndex});
	}


	playPauseSong (e) {
		if(this.state.isPlaying){
			this.state.soundHowl.pause(this.state.playingId);

			this.setState({isPlaying: false, isPaused: true, isStopped: false});

		}
		else if(this.state.isPaused) {
			this.state.soundHowl.volume(this.state.volume);
			let id = this.state.soundHowl.play(this.state.playingId);
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

	render () {
		const sidebarContent = <div>
			<div className='sidebarTitle'>Ampact</div>
			<div className='settings'>
				<div className='cogWrapper' onClick={(e) => this.openSettings(e)}>
					<img src='assets/images/settingsCog.png' />
				</div>
			</div>
		</div>

		let mainContent = <div className='wrapper'>
			<table>
				<thead>
					<tr>
						<th>Song</th>
						<th>Artist</th>
						<th>Album</th>
					</tr>
				</thead>
				<tbody>
					{this.state.songs.map((object, i) => {
						return <tr
							onClick={(ID, url, playingIndex) => this.playSong(object.ID, object.URL, i)}
							className='song' key={i}>
								<td>{object.Title}</td>
								<td>{object.Artist}</td>
								<td>{object.Album}</td>
							</tr>
					})}
				</tbody>
			</table>
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
