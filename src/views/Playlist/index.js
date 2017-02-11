import React from 'react'
import SongRow from '../../components/SongRow'
import {Playlist} from '../../logic/Playlist';
import LoadingSpinner from '../../components/LoadingSpinner'


export default class PlaylistView extends React.Component {
  constructor(props) {
	super(props);


	this.state = {
	  thePlaylist: null
	};

	this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
	this.removeSongFromPlaylist = this.removeSongFromPlaylist.bind(this);
	this.onPlaySong = this.onPlaySong.bind(this);

  }

  componentDidMount() {
	this.downloadAndSetPlaylist(this.props.routeParams.playlistID);
  }

  componentWillReceiveProps(nextProps) {
	console.log("BBY NO!", this.props.routeParams.playlistID, nextProps.routeParams.playlistID);
	if(this.props.routeParams.playlistID != nextProps.routeParams.playlistID) {
	  this.setState({thePlaylist: null});
	  this.downloadAndSetPlaylist(nextProps.routeParams.playlistID);
	}
  }

  downloadAndSetPlaylist(playlistID) {
	this.downloadPlaylist(playlistID, (err, ourPlaylist) => {
	  //TODO: HANDLE ERROR
	  this.setState({thePlaylist: ourPlaylist});
	});
  }

  addSongToPlaylist(AmpacheSongID, Playlist) {
	this.props.connection.addSongToPlaylist(Playlist.ID, AmpacheSongID, (err, cb) => {
	  if (err) {
		//TODO: HANDLE ERRORS!
		console.err(err);
		return false;
	  }
	  this.downloadAndSetPlaylist(this.props.routeParams.playlistID);
	});
  }

  removeSongFromPlaylist(PlaylistTrackNumber) {
    console.log(PlaylistTrackNumber, this.props.routeParams.playlistID);
	this.props.connection.removeSongFromPlaylist(this.props.routeParams.playlistID, PlaylistTrackNumber, (err, cb) => {
	  if (err) {
		//TODO: HANDLE ERRORS!
		console.err(err);
		return false;
	  }
	  console.log("REMOVED");
	  this.downloadAndSetPlaylist(this.props.routeParams.playlistID);
	});
  }

  downloadPlaylist(playlistID, cb) {
    this.props.connection.getPlaylist(playlistID, (err, playlist) => {
	  if(err) {
		return cb(err, null);
	  }
	  this.props.connection.getPlaylistSongs(playlistID, (err, songs) => {
		if(err) {
		  return cb(err, null);
		}
		let ourPlaylist = new Playlist(playlistID, playlist.Name);
		ourPlaylist.Songs = songs;
		return cb(null, ourPlaylist);
	  });
	});
  }

  onPlaySong(AmpacheSongId, playingIndex) {
	if (typeof this.props.onPlaySong === 'function') {
	  let playlistSongs = Array.from(this.state.thePlaylist.Songs, (song) => {
		return song[1];
	  });
	  this.props.onPlaySong(AmpacheSongId, playlistSongs, playingIndex);
	}
  }

  render() {
	if(this.state.thePlaylist == null) {
	  return <LoadingSpinner />
	}

	let i = 0;
	let songRows = [];
	this.state.thePlaylist.Songs.forEach((theSong, playlistTrackID) => {
	  songRows.push(<SongRow key={i} allPlaylists={this.props.allPlaylists}
					  Index={i} Song={theSong}
					  playlistTrackID={playlistTrackID}
					  playingAmpacheSongId={this.props.playingAmpacheSongId}
					  loadingAmpacheSongId={this.props.loadingAmpacheSongId}
					  currentPlaylistID={this.props.routeParams.playlistID}
					  onPlaySong={this.onPlaySong}
					  format="playlist"
					  onAddSongToPlaylist={this.addSongToPlaylist}
					  onRemoveSongFromPlaylist={this.removeSongFromPlaylist}/>);
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
};
// Verify Prop Types
PlaylistView.propTypes = {
  allSongs: React.PropTypes.object,
  allPlaylists: React.PropTypes.object,
  onPlaySong: React.PropTypes.func,
  playingAmpacheSongId: React.PropTypes.number,
  loadingAmpacheSongId: React.PropTypes.number,
  onAddSongToPlaylist: React.PropTypes.func,
  onRemoveSongFromPlaylist: React.PropTypes.func,
  updatePlaylist: React.PropTypes.func
};
