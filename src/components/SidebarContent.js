import {Component} from 'react'
import classNames from 'classnames';
const BrowserWindow = require('electron').remote.BrowserWindow;
import {Link} from 'react-router';
import SweetAlert from 'sweetalert-react';
const remote = require('electron').remote;
const Menu = remote.Menu;

class SidebarContent extends Component {
  constructor(props) {
	super(props);

	this.state = {
	  sidebarOpen: true,
	  docked: true,
	  transitions: false,
	  showNewPlaylistPrompt: false,
	  confirmPlaylistDelete: false,
	  playlistIDToDelete: null
	};
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

  playlistContextMenu(e, Playlist) {
	e.preventDefault();

	let that = this;

	let template = [
	  {
		label: 'Delete',
		click () {
		  console.log(Playlist);
		  that.setState({confirmPlaylistDelete: true, playlistIDToDelete: parseInt(Playlist.ID)});
		}
	  }
	];

	const menu = Menu.buildFromTemplate(template);
	menu.popup(remote.getCurrentWindow());
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

	let playlistButtons = [];
	let playlistNames = [];

	this.props.allPlaylists.forEach((playlist, i) => {
	  playlistNames.push(playlist.Name);
	  playlistButtons.push(<Link onContextMenu={(e, Song) => this.playlistContextMenu(e, playlist)} key={playlist.ID} to={{pathname: `/playlist/${playlist.ID}`}}>
		<button className='playlistButton' key={playlist.ID}>{playlist.Name} - {playlist.ID}</button>
	  </Link>);
	});



	return (
		<div>
		  <SweetAlert
			  show={this.state.showNewPlaylistPrompt}
			  title="New Playlist"
			  text="What is the name of your new playlist"
			  type='input'
			  inputPlaceholder="Playlist Name"
			  showCancelButton
			  confirmButtonColor='#03A9F4'
			  onConfirm={(inputValue) => {
				console.log(inputValue);
				if (playlistNames.indexOf(inputValue) != -1) {
				  swal({
						title: "Duplicate",
						text: "A Playlist with that name already exists",
						type: "info",
						showCancelButton: true,
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Yes, create it!"
					  },
					  function(){
						this.setState({ showNewPlaylistPrompt: false });
						this.props.newPlaylist(inputValue);
					  }.bind(this));
				  return;
				}
				this.setState({ showNewPlaylistPrompt: false });
				this.props.newPlaylist(inputValue);
			  }}
			  onCancel={() => this.setState({ showNewPlaylistPrompt: false })}
			  onEscapeKey={() => this.setState({ showNewPlaylist: false })}
			  onOutsideClick={() => this.setState({ showNewPlaylist: false })}
		  />
		  <SweetAlert
			  show={this.state.confirmPlaylistDelete}
			  type='warning'
			  title="Delete Playlist"
			  text="Are you sure you want to delete the playlist"
			  showCancelButton
			  onCancel={() => this.setState({ confirmPlaylistDelete: false })}
			  onEscapeKey={() => this.setState({ confirmPlaylistDelete: false })}
			  onOutsideClick={() => this.setState({ confirmPlaylistDelete: false })}
			  confirmButtonColor='#DD6B55'
		  	  confirmButtonText="Yes, delete it!"
			  onConfirm={() => {
				this.props.deletePlaylist(this.state.playlistIDToDelete);
				this.setState({ confirmPlaylistDelete: false })
			  }}
		  />
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
			  {playlistButtons}
			</div>
			<div className='createPlaylist'>
			  <button onClick={(e) => this.setState({showNewPlaylistPrompt: true})}><img src='assets//images//plusIcon.png' />New Playlist</button>
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