import React from 'react'
const storage = require('electron-json-storage');
const remote = require('electron').remote;
import SongRow from '../../components/SongRow'
// import _ from 'lodash'
import {debounce} from 'lodash';


export default class PlaylistView extends React.Component {
  constructor(props) {
	super(props);

	this.state = {};
	this.refreshPlaylist = debounce(() => {
		  console.log("TRY", this.props.routeParams.playlistID);
		  this.context.updatePlaylist(this.props.routeParams.playlistID, (err, result) => {
			console.log("UPDATED");
		  });
		}, 5000, {leading: true, trailing: false, maxWait: 5000}
	);
  }

  componentWillReceiveProps() {
    this.refreshPlaylist();
  }

  render() {
	return (
		<div className='wrapper'>
		  <div className='headers'>
			<div className='song'>Song</div>
			<div className='artist'>Artist</div>
			<div className='album'>Album</div>
		  </div>
		  <div className='songs'>
			{
			  this.context.allPlaylists[this.props.routeParams.playlistID].Songs.map((songID, index) => {
				let theSong = this.context.allSongs[songID];
				return <SongRow key={index} Playlists={this.context.allPlaylists}
								currentPlaylist={this.state.currentPlaylist}
								Index={index} Song={theSong}
								playingAmpacheSongId={this.context.playingAmpacheSongId}
								loadingAmpacheSongId={this.context.loadingAmpacheSongId}
								currentPlaylistID={this.props.routeParams.playlistID}
								onAddSongToPlaylist={this.context.addSongToPlaylist}
								onRemoveSongFromPlaylist={this.context.removeSongFromPlaylist}/>
			  })}
		  </div>
		</div>
	);
  }
};
// Access parent context by defining contextTypes
PlaylistView.contextTypes = {
  allSongs: React.PropTypes.array,
  allPlaylists: React.PropTypes.array,
  onPlaySong: React.PropTypes.func,
  playingAmpacheSongId: React.PropTypes.number,
  loadingAmpacheSongId: React.PropTypes.number,
  onAddSongToPlaylist: React.PropTypes.func,
  onRemoveSongFromPlaylist: React.PropTypes.func,
  updatePlaylist: React.PropTypes.func
};
