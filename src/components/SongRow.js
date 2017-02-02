import React from 'react';
import { Component } from 'react'
const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
import classNames from 'classnames';
import {Link} from 'react-router';


class SongRow extends Component  {
	constructor(props) {
		super(props);
		console.log(props);
	}

	isSongInPlaylist(songID, Playlist) {
		console.log(songID, Playlist);
		if(Playlist.Songs && Playlist.Songs.length <= 0) {
			return false;
		}
		// for(let x = 0; x != Playlist.Songs.length; x++) {
		// 	console.log(songID, Playlist.Songs[x]);
		// 	if(songID == Playlist.Songs[x]){
		// 		console.log("HIT");
		// 		return true;
		// 	}
		// }
	  return Playlist.Songs.has(songID);
	}

	contextMenu (e, Song) {
		console.log('right-clicked', e);
		e.preventDefault();

		let that = this;

		console.log(that.props);

		let addToPlaylistEntry = [


		];
		this.props.allPlaylists.forEach((Playlist, ID) => {
			let inPlaylist = that.isSongInPlaylist(Song.ID, Playlist);
			addToPlaylistEntry.push({
					label: Playlist.Name,
					enabled: !inPlaylist,
					click() {
					  that.props.onAddSongToPlaylist(Song.ID, Song.PlaylistTrackNumber, Playlist);
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
				enabled: that.props.currentPlaylistID != -1 && that.props.currentPlaylistID != 999,
				click () {
				  let playlistTrackNumber = that.props.allPlaylists.get(parseInt(that.props.currentPlaylistID)).Songs.get(Song.ID);
				  that.props.onRemoveSongFromPlaylist(Song.ID, playlistTrackNumber, that.props.allPlaylists.get(parseInt(that.props.currentPlaylistID)));
				}
			}
		];


		const menu = Menu.buildFromTemplate(template);
		menu.popup(remote.getCurrentWindow());
	}

	playSong (AmpacheSongId, URL, playingIndex) {
		if (typeof this.props.onPlaySong === 'function') {
		  this.props.onPlaySong(AmpacheSongId, URL, playingIndex);
		}
	}

	renderAlbum (e, albumID){
		e.preventDefault(); // Let's stop this event.
		e.stopPropagation(); // Really this time.
		if (typeof this.props.onRenderAlbum === 'function') {
			this.props.onRenderAlbum(albumID);
		}
	}

	renderArtist (e, artistID){
		e.preventDefault(); // Let's stop this event.
		e.stopPropagation(); // Really this time.
		if (typeof this.props.onRenderArtist === 'function') {
			this.props.onRenderArtist(artistID);
		}
	}

	favSong (e, AmpacheSongId) {
		if (typeof this.props.onFavSong === 'function') {
			this.props.onFavSong(e, AmpacheSongId);
		}
	}

	render () {
		let songClasses = classNames('song', {'playingNow': this.props.Song.ID == this.props.playingAmpacheSongId, 'loadingNow': this.props.Song.ID == this.props.loadingAmpacheSongId});
		let favoriteIconClasses = classNames('favSong', {'favorited': this.props.Song.Favorite});
		return (
			<div onClick={(AmpacheSongId, url, playingIndex) => this.playSong(this.props.Song.ID, this.props.Index)}
				onContextMenu={(e, Song) => this.contextMenu(e, this.props.Song)} className={songClasses} >
					<div className={favoriteIconClasses} onClick={(e, AmpacheSongId) => this.favSong(e, this.props.Song.ID)}></div>
					<div className='songTitleWrapper'>
					  <div className='songTitle'>{this.props.Song.Title} - {this.props.Song.ID}</div>
					</div>
					<div className='songArtistWrapper'>
					  <div className='songArtist' onClick={(e, ampacheArtist) => this.renderArtist(e, this.props.Song.artistID)}>{this.props.Song.Artist}</div>
					</div>
			  		<div className='songAlbumWrapper'>
					  <Link onClick={(e) => e.stopPropagation()} to={{pathname: `/album/${this.props.Song.albumID}`}}><div className='songAlbum'>{this.props.Song.Album}</div></Link>
					</div>
			</div>
		);
	}
}

SongRow.propTypes = {
	Song: React.PropTypes.object,
	Index: React.PropTypes.number.isRequired,
	playingAmpacheSongId: React.PropTypes.number.isRequired,
	onPlaySong: React.PropTypes.func.isRequired,
  	onAddSongToPlaylist: React.PropTypes.func
	// onFavSong: React.PropTypes.func.isRequired,
	// onRenderAlbum: React.PropTypes.func.isRequired,
	// onRenderArtist: React.PropTypes.func.isRequired
};

export default SongRow;