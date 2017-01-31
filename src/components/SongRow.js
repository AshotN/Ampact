import React from 'react';
import { Component } from 'react'
const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
import classNames from 'classnames';


class SongRow extends Component  {
	constructor(props) {
		super(props);

		this.state = {
		}
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

		console.log(this.context.allPlaylists);

		let addToPlaylistEntry = [


		];
		this.context.allPlaylists.forEach((Playlist, ID) => {
			let inPlaylist = that.isSongInPlaylist(Song.ID, Playlist);
			addToPlaylistEntry.push({
					label: Playlist.Name,
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
				enabled: that.props.currentPlaylistID != -1 && that.props.currentPlaylistID != 999,
				click () {
				  console.log(that.props.currentPlaylistID);
					that.handlePlaylist(Song, that.context.allPlaylists[that.props.currentPlaylistID], true);
				}
			}
		];


		const menu = Menu.buildFromTemplate(template);
		menu.popup(remote.getCurrentWindow());
	}

	handlePlaylist (Song, Playlist, inPlaylist) {
		console.log(Playlist, inPlaylist);
		if (!inPlaylist && typeof this.context.onAddSongToPlaylist === 'function') {
			this.context.onAddSongToPlaylist(Song.ID, Playlist);
		}
		else if (inPlaylist && typeof this.context.onRemoveSongFromPlaylist === 'function') {
			this.context.onRemoveSongFromPlaylist(Song, Playlist);
		}
	}

	playSong (AmpacheSongId, URL, playingIndex) {
	  console.log("A", this.context);
		if (typeof this.context.onPlaySong === 'function') {
		  console.log("B");
		  this.context.onPlaySong(AmpacheSongId, URL, playingIndex);
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
			<div onClick={(AmpacheSongId, url, playingIndex) => this.playSong(this.props.Song.ID, this.props.Song.URL, this.props.Index)}
				onContextMenu={(e, Song) => this.contextMenu(e, this.props.Song)} className={songClasses} >
					<div className={favoriteIconClasses} onClick={(e, AmpacheSongId) => this.favSong(e, this.props.Song.ID)}></div>
					<div className='songTitleWrapper'>
					  <div className='songTitle'>{this.props.Song.Title}</div>
					</div>
					<div className='songArtistWrapper'>
					  <div className='songArtist' onClick={(e, ampacheArtist) => this.renderArtist(e, this.props.Song.artistID)}>{this.props.Song.Artist}</div>
					</div>
			  		<div className='songAlbumWrapper'>
					  <div className='songAlbum' onClick={(e, ampacheAlbum) => this.renderAlbum(e, this.props.Song.albumID)}>{this.props.Song.Album}</div>
					</div>
			</div>
		);
	}
}

SongRow.propTypes = {
	// Song: React.PropTypes.object.isRequired,
	// Index: React.PropTypes.number.isRequired,
	// playingAmpacheSongId: React.PropTypes.number.isRequired,
	// onPlaySong: React.PropTypes.func.isRequired,
	// onFavSong: React.PropTypes.func.isRequired,
	// onRenderAlbum: React.PropTypes.func.isRequired,
	// onRenderArtist: React.PropTypes.func.isRequired
};

// Access parent context by defining contextTypes
SongRow.contextTypes = {
  onPlaySong: React.PropTypes.func,
  allPlaylists: React.PropTypes.array,
  onAddSongToPlaylist: React.PropTypes.func,
  onRemoveSongFromPlaylist: React.PropTypes.func
};

export default SongRow;