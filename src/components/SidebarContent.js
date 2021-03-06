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
			playlistIDToDelete: null,
			confirmDuplicatePrompt: false,
			newPlaylistName: null
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
			playlistButtons.push(<Link onContextMenu={(e, Song) => this.playlistContextMenu(e, playlist)} key={playlist.ID}
			                           to={{pathname: `/playlist/${playlist.ID}`}}>
				<button className='playlistButton' key={playlist.ID}>{playlist.Name} - {playlist.ID}</button>
			</Link>);
		});

		return (
			<div>
				{/*Clicked on the New Playlist button*/}
				<SweetAlert
					show={this.state.showNewPlaylistPrompt}
					title='New Playlist'
					text='What is the name of your new playlist'
					type='input'
					inputPlaceholder='Playlist Name'
					showCancelButton
					confirmButtonColor='#03A9F4'
					onConfirm={(inputValue) => {
						console.log(inputValue);
						if(playlistNames.indexOf(inputValue) != -1) {
							this.setState({confirmDuplicatePrompt: true, newPlaylistName: inputValue});
						} else if(inputValue === '') {
							swal.showInputError(`Blank names don't work well with Ampache`);
						} else {
							this.setState({showNewPlaylistPrompt: false});
							this.props.newPlaylist(inputValue);
						}
					}}
					onCancel={() => this.setState({showNewPlaylistPrompt: false})}
					onEscapeKey={() => this.setState({showNewPlaylistPrompt: false})}
					onOutsideClick={() => this.setState({showNewPlaylistPrompt: false})}
				/>
				{/*A playlist with that name existed already*/}
				<SweetAlert
					show={this.state.confirmDuplicatePrompt}
					title='Duplicate'
					text='A Playlist with that name already exists'
					type='info'
					showCancelButton
					confirmButtonColor='#DD6B55'
					confirmButtonText='Yes, create it!'
					onConfirm={() => {
						this.setState({showNewPlaylistPrompt: false, confirmDuplicatePrompt: false});
						this.props.newPlaylist(this.state.newPlaylistName);
					}}
					onCancel={() => {
						this.setState({showNewPlaylistPrompt: false, confirmDuplicatePrompt: false});
					}}
				/>
				{/*You sure you wanna delete that playlist?*/}
				<SweetAlert
					show={this.state.confirmPlaylistDelete}
					type='warning'
					title='Delete Playlist'
					text='Are you sure you want to delete the playlist'
					showCancelButton
					onCancel={() => this.setState({confirmPlaylistDelete: false, playlistIDToDelete: null})}
					onEscapeKey={() => this.setState({confirmPlaylistDelete: false, playlistIDToDelete: null})}
					onOutsideClick={() => this.setState({confirmPlaylistDelete: false, playlistIDToDelete: null})}
					confirmButtonColor='#DD6B55'
					confirmButtonText='Yes, delete it!'
					onConfirm={() => {
						this.props.deletePlaylist(this.state.playlistIDToDelete);
						this.setState({confirmPlaylistDelete: false, playlistIDToDelete: null})
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
						<button onClick={(e) => this.setState({showNewPlaylistPrompt: true})}>
							<i className='icon-plus'/>
							New Playlist
						</button>
					</div>
				</div>
				<div className='settings'>
					<div className='cogWrapper' onClick={(e) => this.openSettings(e)}>
						<i className='icon-cog'/>
					</div>
				</div>
			</div>
		);
	}
}

export default SidebarContent;
