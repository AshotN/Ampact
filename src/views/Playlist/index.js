import React from 'react'
const storage = require('electron-json-storage');
const remote = require('electron').remote;
import SongRow from '../../components/SongRow'
// import _ from 'lodash'
import {debounce} from 'lodash';


export default class PlaylistView extends React.Component {
  constructor(props) {
	super(props);

	console.log("props", props);

	this.state = {};
	this.refreshPlaylist = debounce(() => {
		  console.log("TRY", this.props.routeParams.playlistID);
		  this.props.updatePlaylist(this.props.routeParams.playlistID, (err, result) => {
			console.log("UPDATED");
		  });
		}, 5000, {leading: true, trailing: false, maxWait: 5000}
	);
  }

  componentWillReceiveProps() {
    this.refreshPlaylist();
  }

  render() {
	let songRows = [];

	let i = 0;
	this.props.allPlaylists.get(parseInt(this.props.routeParams.playlistID)).Songs.forEach((playlistTrackID, songID) => {
	  let theSong = this.props.allSongs.get(songID);
	  songRows.push(<SongRow key={i} allPlaylists={this.props.allPlaylists}
					  currentPlaylist={this.state.currentPlaylist}
					  Index={i} Song={theSong}
					  playingAmpacheSongId={this.props.playingAmpacheSongId}
					  loadingAmpacheSongId={this.props.loadingAmpacheSongId}
					  currentPlaylistID={this.props.routeParams.playlistID}
					  onPlaySong={this.props.onPlaySong}
					  onAddSongToPlaylist={this.props.onAddSongToPlaylist}
					  onRemoveSongFromPlaylist={this.props.onRemoveSongFromPlaylist}/>);
	  i++;
	});
	return (
		<div className='wrapper'>
		  <div className='headers'>
			<div className='song'>Song</div>
			<div className='artist'>Artist</div>
			<div className='album'>Album</div>
		  </div>
		  <div className='songs'>
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
