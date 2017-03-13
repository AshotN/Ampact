import React from 'react';
import SongRow from '../../components/SongRow';
import LoadingSpinner from '../../components/LoadingSpinner';
// import {Artist} from '../../logic/Artist';


export default class ArtistView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      theArtistSongs: []
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
      console.log(playingIndex);
      this.props.onPlaySong(AmpacheSongId, this.state.theArtistSongs, playingIndex);
    }
  }

  render() {
    if(this.state.theArtistSongs == null || this.state.theArtistSongs.length == 0) {
      return <LoadingSpinner />
    }

    let i = 0;
    let songRows = [];
    this.state.theArtistSongs.map((theSong) => {
      songRows.push(<SongRow key={i}
        allPlaylists={this.props.allPlaylists} //Needed for context menu
        Index={i} Song={theSong}
        playingAmpacheSongId={this.props.playingAmpacheSongId}
        loadingAmpacheSongId={this.props.loadingAmpacheSongId}
        history={this.props.history}
        onPlaySong={this.onPlaySong}
        addtoQueue={this.props.addtoQueue}
        format="artist"
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

