import { Component } from 'react'
import Sidebar from 'react-sidebar'
import { Ampache } from '../logic/Ampache'
import { Howl } from 'howler'

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
			playingId: 0
		}
	}

	openSettings (e) {
		console.log('I should really make this');//TODO: Figure this out!
	}

	connect () {
		this.connection = new Ampache('hego555', 'vq7map509lz9', 'https://login.hego.co/index.php/apps/music/ampache');
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

	playSong (ID, URL) {



		console.log(ID, URL);
		var sound = new Howl({
			src: [URL],
			format: ['mp3'],
			html5: true,
		});

			this.setState({isPlaying: false, isPaused: false, isStopped: true});

		}

		this.state.soundHowl = sound;
		let id = this.state.soundHowl.play();
		this.state.playingId = id;

		this.setState({isPlaying: true, isPaused: false, isStopped: false});


	}

	playPauseSong (e){
		if(this.state.isPlaying){
			this.state.soundHowl.pause(this.state.playingId);

			this.setState({isPlaying: false, isPaused: true, isStopped: false});

		}
		else if(this.state.isPaused) {
			let id = this.state.soundHowl.play(this.state.playingId);
			console.log("resume: "+id);
			this.setState({isPlaying: true, isPaused: false, isStopped: false});
		}
	}

	render () {
		let footer = <div className='footer'>
									<div className='playPauseButton'>
										<div className={this.state.isPlaying ? 'pause' : 'play'} onClick={(e) => this.playPauseSong(e)} />
								 	</div>
								 </div>

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
              onClick={(ID, url) => this.playSong(object.ID, object.URL)}
              className='song' key={i}>
                <td>{object.Title}</td>
                <td>{object.Artist}</td>
                <td>{object.Album}</td>
              </tr>
          })}
        </tbody>
      </table>
      <button onClick={(e) => this.connect(e)}> Connect </button>
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
			{footer}
			</div>

==== BASE ====
		);
	}
}
