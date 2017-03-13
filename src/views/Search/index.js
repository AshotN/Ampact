import React from 'react';
import SongRow from '../../components/SongRow';
import LoadingSpinner from '../../components/LoadingSpinner';
export default class SearchView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			theSongs: []
		};

		this.onPlaySong = this.onPlaySong.bind(this);
	}

	componentDidMount() {
		this.searchSongs(this.props.routeParams.searchTerm, (err, ourSongs) => {
			//TODO: HANDLE ERROR
			this.setState({theSongs: ourSongs});
		});
	}

	componentWillReceiveProps(nextProps) {
		if(this.props.routeParams.searchTerm != nextProps.routeParams.searchTerm) {
			this.setState({theSongs: null});
			this.searchSongs(nextProps.routeParams.searchTerm, (err, ourSongs) => {
				//TODO: HANDLE ERROR
				console.log("songs", ourSongs);
				this.setState({theSongs: ourSongs});
			});
		}
	}

	searchSongs(searchTerm, cb) {
		this.props.connection.searchSongs(searchTerm, (err, searchResult) => {
			if(err) {
				return cb(err, null);
			}
			cb(null, searchResult);
		});
	}

	onPlaySong(AmpacheSongId, playingIndex) {
		if(typeof this.props.onPlaySong === 'function') {
			this.props.onPlaySong(AmpacheSongId, this.state.theSongs, playingIndex);
		}
	}

	render() {
		if(this.state.theSongs === null) {
			return <LoadingSpinner />;
		}

		let i = 0;
		let songRows = [];
		this.state.theSongs.map((theSong) => {
			songRows.push(<SongRow key={i}
			                       allPlaylists={this.props.allPlaylists} //Needed for context menu
			                       Index={i} Song={theSong}
			                       playingAmpacheSongId={this.props.playingAmpacheSongId}
			                       loadingAmpacheSongId={this.props.loadingAmpacheSongId}
			                       onPlaySong={this.onPlaySong}
			                       addtoQueue={this.props.addtoQueue}
			                       format="search"
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
