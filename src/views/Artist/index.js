import React from 'react';
import SongRow from '../../components/SongRow';
import LoadingSpinner from '../../components/LoadingSpinner';
// import {Artist} from '../../logic/Artist';


export default class ArtistView extends React.Component {

  constructor(props) {
	super(props);
	this.state = {
	  theArtistSongs: null
	};

	this.onPlaySong = this.onPlaySong.bind(this);
  }

  componentDidMount() {
	this.downloadArtist(this.props.routeParams.artistID, (err, ourArtistSongs) => {
	  //TODO: HANDLE ERROR
	  this.setState({theArtistSongs: ourArtistSongs});
	});
  }

  downloadArtist(artistID, cb) {
	this.props.connection.getArtistSongs(artistID, (err, ourArtistSongs) => {
	  if(err) {
		return cb(err, null);
	  }
	  return cb(null, ourArtistSongs);
	});
  }

  onPlaySong(AmpacheSongId, playingIndex) {
	if (typeof this.props.onPlaySong === 'function') {
	  let artistSongs = Array.from(this.state.theArtistSongs, (song) => {
		return song[1];
	  });
	  this.props.onPlaySong(AmpacheSongId, artistSongs, playingIndex);
	}
  }

  render() {
	if(this.state.theArtistSongs == null) {
      return <LoadingSpinner />
	}

	let i = 0;
	let songRows = [];
	this.state.theArtistSongs.forEach((theSong, albumTrackID) => {
	  songRows.push(<SongRow key={i}
							 allPlaylists={this.props.allPlaylists} //Needed for context menu
							 Index={i} Song={theSong}
							 playingAmpacheSongId={this.props.playingAmpacheSongId}
							 loadingAmpacheSongId={this.props.loadingAmpacheSongId}
							 onPlaySong={this.onPlaySong}
							 addtoQueue={this.props.addtoQueue}
							 format="playlist"
							 addSongToPlaylist={this.props.onAddSongToPlaylist}/>);
	  i++;
	});
	return (
		  <div className='songRowWrapper'>
			<div className='songRowHeaders playlistHeaders'>
			  <div className='song'>Song</div>
			  <div className='artist'>Artist</div>
			  <div className='album'>Album</div>
			</div>
			<div className='songs'> {i}
			  {songRows}
			</div>
		  </div>
	);
  }
}

