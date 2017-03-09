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

	this.onPlaySong = this.onPlaySong.bind(this);
  }

  componentDidMount() {
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

  onPlaySong(AmpacheSongId, playingIndex) {
	if (typeof this.props.onPlaySong === 'function') {
	  this.props.onPlaySong(AmpacheSongId, this.state.theAlbum.Songs, playingIndex);
	}
  }

  render() {
    if(this.state.theAlbum == null) {
      return <LoadingSpinner />
	}

	let i = 0;
	let songRows = [];
	this.state.theAlbum.Songs.forEach((theSong, index) => {
	  songRows.push(<SongRow key={i}
							 allPlaylists={this.props.allPlaylists} //Needed for context menu
							 Index={i} Song={theSong}
							 albumTrackID={index+1}
							 playingAmpacheSongId={this.props.playingAmpacheSongId}
							 loadingAmpacheSongId={this.props.loadingAmpacheSongId}
							 onPlaySong={this.onPlaySong}
							 addtoQueue={this.props.addtoQueue}
							 format="album"
							 addSongToPlaylist={this.props.onAddSongToPlaylist}/>);
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

