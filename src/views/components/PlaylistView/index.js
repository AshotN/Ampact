import React from 'react'
const storage = require('electron-json-storage');
const remote = require('electron').remote;
import SongRow from '../SongRow'

export default class PlaylistView extends React.Component {

  constructor(props) {
	super(props);

	this.state = {

	};

  }

  render() {
    console.log(this.context);
	return (
		<div className='wrapper'>
		  <div className='headers'>
			<div className='song'>Song</div>
			<div className='artist'>Artist</div>
			<div className='album'>Album</div>
		  </div>
		  <div className='songs'>
			{
			  this.context.allPlaylists[this.props.location.state.renderPlaylistID].Songs.map((songID, index) => {
				let theSong = this.context.allSongs[songID];
				return <SongRow key={index} Playlists={this.state.playlists} currentPlaylist={this.state.currentPlaylist}
								Index={index} Song={theSong} onPlaySong={this.context.playSong} />
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
  onPlaySong: React.PropTypes.func
};