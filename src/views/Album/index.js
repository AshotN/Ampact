import React from 'react'
import SongRow from '../../components/SongRow'
import LoadingSpinner from '../../components/LoadingSpinner'
import {Album} from '../../logic/Album';


export default class AlbumView extends React.Component {

  constructor(props) {
	super(props);

	this.state = {
	  theAlbum: null
	};

	this.downloadAlbum(this.props.routeParams.albumID, (err, ourAlbum) => {
	  //TODO: HANDLE ERROR
	  this.setState({theAlbum: ourAlbum});
	});
  }

  downloadAlbum(albumID, cb) {
    this.props.connection.getAlbum(albumID, (err, albumInfo) => {
	  if(err) {
		return cb(err, null);
	  }
	  this.props.connection.getAlbumSongs(albumID, (err, songs) => {
		if(err) {
		  return cb(err, null);
		}
		let ourAlbum = new Album(albumID, albumInfo.name, albumInfo.artist.name, albumInfo.artist.id, albumInfo.tracks, albumInfo.art);
	  	ourAlbum.Songs = songs;
	  	return cb(null, ourAlbum);
	  });
	});
  }

  render() {
    if(this.state.theAlbum == null) {
      return <LoadingSpinner />
	}
	let songRows = [];

	let i = 0;
	this.state.theAlbum.Songs.forEach((theSong, albumTrackID) => {
	  songRows.push(<SongRow key={i}
							 allPlaylists={this.props.allPlaylists} //Needed for context menu
							 Index={i} Song={theSong}
							 albumTrackID={albumTrackID}
							 playingAmpacheSongId={this.props.playingAmpacheSongId}
							 loadingAmpacheSongId={this.props.loadingAmpacheSongId}
							 onPlaySong={this.props.onPlaySong}
							 format="album"
							 onAddSongToPlaylist={this.props.onAddSongToPlaylist}
							 onRemoveSongFromPlaylist={this.props.onRemoveSongFromPlaylist}/>);
	  i++;
	});

	return (
		<div className='albumView'>
		  <div className='sideInfo'>
			<div className='coverArt'>
			  <img src={this.state.theAlbum.CoverArt} />
			</div>
			<div className='title'>
			  {this.state.theAlbum.Title} - {this.state.theAlbum.ID}
			</div>
		  </div>
		  <div className='songRowWrapper'>
			<div className='songRowHeaders albumHeaders'>
			  <div className='albumTrackNumber'>#</div>
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

