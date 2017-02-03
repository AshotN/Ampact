import React from 'react'
import SongRow from '../../components/SongRow'

export default class AlbumView extends React.Component {

  constructor(props) {
	super(props);

	this.ourAlbum = this.props.allAlbums.get(parseInt(this.props.routeParams.albumID));
  }

  render() {
	let songRows = [];

	let i = 0;
	this.props.allAlbums.get(parseInt(this.props.routeParams.albumID)).Songs.forEach((albumTrackID, songID) => {
	  let theSong = this.props.allSongs.get(parseInt(songID));
	  songRows.push(<SongRow key={i} allPlaylists={this.props.allPlaylists}
							 currentPlaylist={-1}
							 Index={i} Song={theSong}
							 playingAmpacheSongId={this.props.playingAmpacheSongId}
							 loadingAmpacheSongId={this.props.loadingAmpacheSongId}
							 currentPlaylistID={-1}
							 onPlaySong={this.props.onPlaySong}
							 onAddSongToPlaylist={this.props.onAddSongToPlaylist}
							 onRemoveSongFromPlaylist={this.props.onRemoveSongFromPlaylist}/>);
	  i++;
	});

	return (
		<div className='albumView'>
		  <div className='sideInfo'>
			<div className='coverArt'>
			  <img src={this.ourAlbum.CoverArt} />
			</div>
			<div className='title'>
			  {this.ourAlbum.Title} - {this.ourAlbum.ID}
			</div>
		  </div>
		  <div className='wrapper'>
			<div className='headers'>
			  <div className='#'>#</div>
			  <div className='song'>Song</div>
			  <div className='time'>Duration</div>
			</div>
			<div className='songs'> {i}
			  {songRows}
			</div>
		  </div>
		</div>
	);
  }
}
// Verify Prop Types
AlbumView.propTypes = {
  allAlbums: React.PropTypes.object
};

