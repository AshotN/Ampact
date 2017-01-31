import {Component} from 'react'
import classNames from 'classnames';
const BrowserWindow = require('electron').remote.BrowserWindow;
import {Link} from 'react-router';
import Sidebar from 'react-sidebar'

class SidebarContent extends Component {
  constructor(props) {
	super(props);

	this.state = {
	  sidebarOpen: true,
	  docked: true,
	  transitions: false
	};

	// this.fetchPlaylists();
  }

  openSettings(e) {
	let left = (screen.width / 2);
	let top = (screen.height / 2);

	let win = new BrowserWindow({
	  width: 400,
	  height: 500,
	  x: left,
	  y: top,
	  frame: false,
	  alwaysOnTop: true,
	  resizable: false,
	  show: false,
	  backgroundColor: '#0E0E0E'
	});

	win.loadURL(`file://${__dirname}/../settings.html`);
	win.once('ready-to-show', () => {
	  win.show();
	});
  }


  render() {
	// let playlists = [];
	// this.props.playlists.forEach((value) => {
	//   console.log(this.props.currentPlaylist, value.ID);
	//   let playlistClasses = classNames('playlistButton', {'currentPlaylist': this.props.currentPlaylist == value.ID});
	//
	//   playlists.push(<button className={playlistClasses} key={value.ID}
	// 						 onClick={(ID, Name) => this.props.playlist(value.ID, value.Name)}>{value.Name}</button>);
	// });
	// let homeClasses = classNames('homeButton', {'currentPlaylist': this.props.currentPlaylist == -1});
	// let favoriteClasses = classNames('favoriteButton', {'currentPlaylist': this.props.currentPlaylist == 999});

	console.log(this.props.allPlaylists);
	return (
		<div>
		  <div className='sidebarTitle'>Ampact</div>
		  <div>
			<div className='defaultPlaylists'>
			  <Link to='/'>
				<button className='playlistButton' key={1}>Home</button>
			  </Link>
			  <button className='playlistButton' key={999} disabled>Favorites</button>
			</div>
			<div className='playlists'>
			  <span className='title'>Playlists</span>
			  {this.props.allPlaylists.map((object, i) => {
				console.log(i, object);
				return <Link key={object.ID} to={{pathname: `/playlist/${object.ID}`}}>
				  <button className='playlistButton' key={object.ID}>{object.Name} - {object.ID}</button>
				</Link>;
			  })};
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