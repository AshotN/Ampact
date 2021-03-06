import React from 'react';
const remote = require('electron').remote;
const Menu = remote.Menu;
import classNames from 'classnames';
import {Link} from 'react-router';
import {Song} from '../logic/Song';

class SongRow extends React.Component {
	constructor(props) {
		super(props);
		console.log(props);
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
						that.props.addSongToPlaylist(Song.ID, Playlist);
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
				label: 'Add to Queue',
				click () {
					that.props.addtoQueue(Song);
				}
			},
			{
				type: 'separator'
			}
		];
		if(this.props.format != 'album') {
			template.push({
				label: 'Go to Album',
				click () {
					that.props.history.push(`/album/${that.props.Song.albumID}`);
				}
			});
		}
		if(this.props.format != 'artist') {
			template.push({
				label: 'Go to Artist',
				click () {
					that.props.history.push(`/artist/${that.props.Song.artistID}`);
				}
			});
		}
		template.push(
			{
				type: 'separator'
			},
			{
				label: 'Playlists',
				submenu: addToPlaylistEntry
			}
		);

		if(this.props.format == "playlist") {
			template.push(
				{
					type: 'separator'
				},
				{
					label: 'Remove From This Playlist',
					click () {
						that.props.removeSongFromPlaylist(that.props.playlistTrackID);
					}
				});
		}

		const menu = Menu.buildFromTemplate(template);
		menu.popup(remote.getCurrentWindow(), {async: true});
	}

	playSong(AmpacheSongId, playingIndex) {
		if(typeof this.props.onPlaySong === 'function') {
			this.props.onPlaySong(AmpacheSongId, playingIndex);
		}
	}

	favSong(e, AmpacheSongId) {
		if(typeof this.props.onFavSong === 'function') {
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

		if(this.props.format == "playlist" || this.props.format == "artist" || this.props.format == "search") {
			songInfoItems =
				<div>
					<div className='songWrapper playlistTitleWrapper'>
						<div className='songTitle'>{this.props.Song.Title} - {this.props.Song.ID}</div>
					</div>
					<div className='songWrapper playlistArtistWrapper'>
						<Link onClick={(e) => e.stopPropagation()} to={{pathname: `/artist/${this.props.Song.artistID}`}}>
							<div className='songArtist'>{this.props.Song.Artist}</div>
						</Link>
					</div>
					<div className='songWrapper playlistAlbumWrapper'>
						<Link onClick={(e) => e.stopPropagation()} to={{pathname: `/album/${this.props.Song.albumID}`}}>
							<div className='songAlbum'>{this.props.Song.Album}</div>
						</Link>
					</div>
				</div>;
		} else if(this.props.format == "album") {
			let durationTime = this.props.Song.Duration;

			// Minutes and seconds
			let durationMins = ~~(durationTime / 60);
			let durationSecs = ~~(durationTime % 60);
			let Duration = durationMins + ":" + (durationSecs < 10 ? "0" : "") + durationSecs;

			songInfoItems =
				<div>
					<div className='songWrapper albumTrackWrapper'>
						<div className='songTrack'>{this.props.albumTrackID}</div>
					</div>
					<div className='songWrapper albumTitleWrapper'>
						<div className='songTitle'>{this.props.Song.Title} - {this.props.Song.ID}</div>
					</div>
					<div className='songWrapper albumDurationWrapper'>
						<div className='songDuration'>{Duration}</div>
					</div>
				</div>;
		}
		return (
			<div onClick={(AmpacheSongId, playingIndex) => this.playSong(this.props.Song.ID, this.props.Index)}
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
	addSongToPlaylist: React.PropTypes.func.isRequired
	// onFavSong: React.PropTypes.func.isRequired
};

export default SongRow;
