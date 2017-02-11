import React from 'react';
import {Component} from 'react'
const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
import classNames from 'classnames';
import {Link} from 'react-router';
import {Song} from '../logic/Song';


class SongRow extends Component {
  constructor(props) {
	super(props);
  }

  contextMenu(e, Song) {
	e.preventDefault();

	let that = this;

	let addToPlaylistEntry = [];
	this.props.allPlaylists.forEach((Playlist, PlaylistID) => {
	  if(PlaylistID != this.props.currentPlaylistID) {
		addToPlaylistEntry.push({
		  label: Playlist.Name,
		  click() {
			that.props.onAddSongToPlaylist(Song.ID, Playlist);
		  }
		})
	  }
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
	  }
	];

	if(this.props.format == "playlist") {
	  template.push(
		  {
			type: 'separator'
		  },
		  {
			label: 'Remove From This Playlist',
			click () {
			  that.props.onRemoveSongFromPlaylist(that.props.playlistTrackID);
			}
		  });
	}

	const menu = Menu.buildFromTemplate(template);
	menu.popup(remote.getCurrentWindow());
  }

  playSong(AmpacheSongId, playingIndex) {
	if (typeof this.props.onPlaySong === 'function') {
	  this.props.onPlaySong(AmpacheSongId, playingIndex);
	}
  }

  renderArtist(e, artistID) {
	e.preventDefault(); // Let's stop this event.
	e.stopPropagation(); // Really this time.
	if (typeof this.props.onRenderArtist === 'function') {
	  this.props.onRenderArtist(artistID);
	}
  }

  favSong(e, AmpacheSongId) {
	if (typeof this.props.onFavSong === 'function') {
	  this.props.onFavSong(e, AmpacheSongId);
	}
  }

  render() {
	let songClasses = classNames('song', {
	  'playingNow': this.props.Song.ID == this.props.playingAmpacheSongId,
	  'loadingNow': this.props.Song.ID == this.props.loadingAmpacheSongId
	});
	let favoriteIconClasses = classNames('favSong', {'favorited': this.props.Song.Favorite});
	let songInfoItems = [];

	if (this.props.format == "playlist") {
	  songInfoItems.push(
		  <div className='songWrapper playlistTitleWrapper'>
			<div className='songTitle'>{this.props.Song.Title} - {this.props.Song.ID}</div>
		  </div>,
		  <div className='songWrapper playlistArtistWrapper'>
			<div className='songArtist'
				 onClick={(e, ampacheArtist) => this.renderArtist(e, this.props.Song.artistID)}>{this.props.Song.Artist}</div>
		  </div>,
		  <div className='songWrapper playlistAlbumWrapper'>
			<Link onClick={(e) => e.stopPropagation()} to={{pathname: `/album/${this.props.Song.albumID}`}}>
			  <div className='songAlbum'>{this.props.Song.Album}</div>
			</Link>
		  </div>);
	} else if (this.props.format == "album") {
	  let durationTime = this.props.Song.Duration;

	  // Minutes and seconds
	  let durationMins = ~~(durationTime / 60);
	  let durationSecs = ~~(durationTime % 60);
	  let Duration = durationMins+":"+(durationSecs < 10 ? "0" : "") + durationSecs;

	  songInfoItems.push(
		  <div className='songWrapper albumTrackWrapper'>
			<div className='songTrack'>{this.props.albumTrackID}</div>
		  </div>,
		  <div className='songWrapper albumTitleWrapper'>
			<div className='songTitle'>{this.props.Song.Title} - {this.props.Song.ID}</div>
		  </div>,
		  <div className='songWrapper albumDurationWrapper'>
			<div className='songDuration'>{Duration}</div>
		  </div>);
	}
	return (
		<div onClick={(AmpacheSongId, url, playingIndex) => this.playSong(this.props.Song.ID, this.props.Index)}
			 onContextMenu={(e, Song) => this.contextMenu(e, this.props.Song)} className={songClasses}>
		  <div className={favoriteIconClasses}
			   onClick={(e, AmpacheSongId) => this.favSong(e, this.props.Song.ID)}></div>
		  {songInfoItems}
		</div>
	);
  }
}

SongRow.propTypes = {
  Song: React.PropTypes.instanceOf(Song),
  Index: React.PropTypes.number.isRequired,
  playingAmpacheSongId: React.PropTypes.number.isRequired,
  onPlaySong: React.PropTypes.func.isRequired,
  onAddSongToPlaylist: React.PropTypes.func
  // onFavSong: React.PropTypes.func.isRequired
};

export default SongRow;