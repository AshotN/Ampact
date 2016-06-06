import { Component } from 'react'
import Sidebar from 'react-sidebar'
import { Ampache } from '../logic/Ampache'
import { Howl } from 'howler'


// const defaultStyles = {
//  wrapper: {
//    backgroundColor: '#252527',
//    height: '100%'
//  },
//  table: {
//    width: '100%',
//    color: 'white',
//    textAlign: 'center',
//    'td': {
//      padding: '20px 0'
//    }
//  }
// };





module.exports = class App extends Component {
	constructor (props) {
		super(props)

		this.state = {
			sidebarOpen: true,
			docked: true,
			transitions: false,
			connection: null,
			songs: [],
			soundHowl: null
		}
	}

	

	openSettings (e) {
		console.log("I should really make this");//TODO: Figure this out!
	}

	connect () {
		var that = this;
		this.state.connection = new Ampache("hego555", "vq7map509lz9", "https://login.hego.co/index.php/apps/music/ampache");
		this.state.connection.handshake((err, result) => {
			if(err) {
				//handle error
			}
			else {
				this.state.connection.getSongs((err, songs) => {
					songs.forEach(function(song) {
						console.log(song);
						var nextState = that.state.songs;
						nextState.push(song);				
						that.setState(nextState);		
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
		if(this.state.soundHowl != null && this.state.soundHowl.playing()){
			this.state.soundHowl.stop();
		}
		this.state.soundHowl = sound;
		this.state.soundHowl.play();

	}

	render () {
		const sidebarContent = <div>
														 <div className='sidebarTitle'>Ampact</div>
														 <div className='settings'>
															<div className='cogWrapper' onClick={(e) => this.openSettings(e)}>
																<img src='assets/images/settingsCog.png' />   
															</div>
														 </div>
													 </div>;

		var that = this;
		let mainContent = 
											<div className='wrapper' /*style={defaultStyles.wrapper}*/>
												<table /*style={defaultStyles.table}*/>
													<thead>
														<tr>
															<th>Song</th>
															<th>Artist</th>
															<th>Album</th>
														</tr>
													</thead>
													<tbody>
														{this.state.songs.map(function(object, i){
															 return <tr onClick={(ID, url) => that.playSong(object.ID, object.URL)} className='song' key={i}>
																	<td>{object.Title}</td>
																	<td>{object.Artist}</td>
																	<td>{object.Album}</td>
																</tr>
														})}
													</tbody>
												</table>
												<button onClick={(e) => this.connect(e)}>Connect</button>
											</div>

							

		return (
			<Sidebar sidebar={sidebarContent}
			 open={this.state.sidebarOpen}
			 docked={this.state.docked}
			 transitions={this.state.transitions}
			 sidebarClassName='sidebar'>
				{mainContent}
			</Sidebar>

		);
	}
}
