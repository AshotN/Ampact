import {Component} from 'react'
import classNames from 'classnames';

class SidebarContent extends Component {
  constructor(props) {
	super(props);

	this.state = {};

  }



  render() {
	let playlists = [];
	this.props.playlists.forEach((value) => {
	  console.log(this.props.currentPlaylist, value.ID);
	  let playlistClasses = classNames('playlistButton', {'currentPlaylist': this.props.currentPlaylist == value.ID});

	  playlists.push(<button className={playlistClasses} key={value.ID}
							 onClick={(ID, Name) => this.props.playlist(value.ID, value.Name)}>{value.Name}</button>);
	});
	let homeClasses = classNames('homeButton', {'currentPlaylist': this.props.currentPlaylist == -1});
	let favoriteClasses = classNames('favoriteButton', {'currentPlaylist': this.props.currentPlaylist == 999});

	return (
		<div>
		  <div className='sidebarTitle'>Ampact</div>
		  <div>
			<div className='defaultPlaylists'>
			  <button className={homeClasses} onClick={(e) => this.props.home(e)}>Home</button>
			  <button className={favoriteClasses} onClick={(e) => this.props.favorites(e)}>Favorites</button>
			</div>
			<div className='playlists'>
			  <span className='title'>Playlists</span>
			  {playlists}
			</div>
		  </div>
		  <div className='settings'>
			<div className='cogWrapper' onClick={(e) => this.openSettings(e)}>
			  <img src='assets//images//settingsCog.png'/>
			</div>
		  </div>
		</div>
	);
  }
}

export default SidebarContent;