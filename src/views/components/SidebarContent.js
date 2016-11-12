import { Component } from 'react'

class SidebarContent extends Component  {
	constructor(props) {
		super(props);

		this.state = {

		};

		this.home = this.home.bind(this);
		this.favorites = this.favorites.bind(this);
		this.playlist = this.playlist.bind(this);
	}

	render () {
		return ( 
			<div>
				<div className='sidebarTitle'>Ampact</div>
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
						<img src='assets//images//settingsCog.png' />
					</div>
				</div>
			</div>
		);
	}
}

export default SidebarContent;