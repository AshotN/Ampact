import { Component } from 'react'
const remote = require('electron').remote
const Menu = remote.Menu
const MenuItem = remote.MenuItem
import classNames from 'classnames';


class SongRow extends Component  {
	constructor(props) {
		super(props);

		this.state = {

		};

	}

	isSongInPlaylist(songID, Playlist) {
		console.log(songID, Playlist);
		if(Playlist.Songs && Playlist.Songs.length <= 0) {
			return false;
		}
		for(let x = 0; x != Playlist.Songs.length; x++) {
			console.log(songID, Playlist.Songs[x]);
			if(songID == Playlist.Songs[x]){
				console.log("HIT");
				return true;
			}
		}
	}

	contextMenu (e, Song) {
		console.log('right-clicked', e);
		e.preventDefault();

		let that = this;

		console.log(this.props.Playlists);

		let addToPlaylistEntry = [


		];
		this.props.Playlists.forEach((Playlist, Name) => {
			let inPlaylist = that.isSongInPlaylist(Song.ID, Playlist);
			addToPlaylistEntry.push({
					label: Name,
					enabled: !inPlaylist,
					click() {
						that.handlePlaylist(Song, Playlist, inPlaylist);
					}
			})
		});

		let template = [
			{
				label: 'Favorite',
				accelerator: 'CmdOrCtrl+F',
				type: 'checkbox',
				checked: this.props.Song.Favorite,
				click () {
					that.favSong(null, Song.ID);
				}
			},
			{
				label: 'Playlists',
				submenu: addToPlaylistEntry
			},
			{
				type: 'separator'
			},
			{
				label: 'Remove From This Playlist',
				enabled: this.props.currentView != -1 && this.props.currentView != 999,
				click () {
					that.handlePlaylist(Song, that.props.Playlists.get(that.props.currentView), true);
				}
			}
		];


		const menu = Menu.buildFromTemplate(template);
		menu.popup(remote.getCurrentWindow());
	}

	handlePlaylist (Song, Playlist, inPlaylist) {
		console.log(Playlist, inPlaylist);
		if (!inPlaylist && typeof this.props.onAddSongToPlaylist === 'function') {
			this.props.onAddSongToPlaylist(Song.ID, Playlist);
		} 
		else if (inPlaylist && typeof this.props.onRemoveSongFromPlaylist === 'function') {
			this.props.onRemoveSongFromPlaylist(Song, Playlist);
		}
	}

	playSong (AmpacheSongId, URL, playingIndex) {
		if (typeof this.props.onPlaySong === 'function') {
			this.props.onPlaySong(AmpacheSongId, URL, playingIndex);
		}
	}

	favSong (e, AmpacheSongId) {
		if (typeof this.props.onFavSong === 'function') {
			this.props.onFavSong(e, AmpacheSongId);
		}		
	}



	render () {
		console.log(this.props.Song.ID == this.props.playingAmpacheSongId);
		let songClasses = classNames('song', {'playingNow': this.props.Song.ID == this.props.playingAmpacheSongId});
		let favoriteIconClasses = classNames('favSong', {'favorited': this.props.Song.Favorite});
		return ( 
			<div onClick={(AmpacheSongId, url, playingIndex) => this.playSong(this.props.Song.ID, this.props.Song.URL, this.props.Index)}
				onContextMenu={(e, Song) => this.contextMenu(e, this.props.Song)} className={songClasses} >
					<div className={favoriteIconClasses} onClick={(e, AmpacheSongId) => this.favSong(e, this.props.Song.ID)}></div>
					<div>{this.props.Song.Title}</div>
					<div>{this.props.Song.Artist}</div>
					<div>{this.props.Song.Album}</div>
			</div>
		);
	}
}

SongRow.propTypes = {
	Song: React.PropTypes.object.isRequired,
	Index: React.PropTypes.number.isRequired,
	playingAmpacheSongId: React.PropTypes.number.isRequired,
	onPlaySong: React.PropTypes.func.isRequired,
	onFavSong: React.PropTypes.func.isRequired

};

export default SongRow;