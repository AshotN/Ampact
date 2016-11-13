import { Component } from 'react'

class Footer extends Component  {
	constructor(props) {
		super(props);

		this.state = {
			volumeDrag: false,
			seekDrag: false,
			volumeBarPos: 0.5,
			seekBarPos: 0,
			songTime: 0,
			elapsedTime: 0,
			seekLoopId: -1,
			durationTimeStamp: -1,
		};

		this.onVolumeMouseDown = this.onVolumeMouseDown.bind(this);
		this.onSeekMouseDown = this.onSeekMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
	}
	componentDidUpdate(prevProps) {
		//TODO: Remove third condition when FLAC support becomes native!
		// if(prevProps.isPlaying == false && this.props.isPlaying && this.props.playingHowlID != -1) {
		// 	console.log("Start A");
		// 	this.clearSeekBar();
		// 	this.startSeekBar();
		// }else if(prevProps.isPlaying && this.props.isPaused) {
		// 	console.log("Start C");
		// 	this.pauseSeekBar();
		// }else if(prevProps.playingHowlID != this.props.playingHowlID ) {
		// 	console.log("Start B");
		// 	this.clearSeekBar();
		// 	this.startSeekBar();
		// }else if(this.props.isStopped){
		// 	console.log("Start C");
		// 	this.clearSeekBar();
		// }

		if(prevProps.isLoading && this.props.isPlaying) {
			this.clearSeekBar();
			this.startSeekBar();
		} else if(prevProps.isPlaying && this.props.isPaused) {
			this.pauseSeekBar();
		} else if(prevProps.isPaused && this.props.isPlaying){
			this.startSeekBar();
		}
		
	}


	changeVolume (newVolume) {
		if (typeof this.props.onVolumeChange === 'function') {
			this.props.onVolumeChange(newVolume);
		}
	}

	startSeekBar(startTime = 0, refreshRate = 500) {
		let duration = this.props.soundHowl.duration(this.props.playingHowlID) * 1000;
		this.setState({durationTimeStamp: duration});
		let currentSongID = this.props.playingHowlID;
		let seekLoopId = setInterval(() => {
			if(currentSongID == -1){
				console.log("TRY TO AVOID THIS");
				clearInterval(seekLoopId);
			}
			let percentElapsed = this.state.elapsedTime / duration;
			this.setState({seekBarPos: percentElapsed, elapsedTime: this.state.elapsedTime + refreshRate});
		}, refreshRate);
		this.setState({seekLoopId: seekLoopId});
	}


	clearSeekBar() {
		this.pauseSeekBar();
		this.setState({seekBarPos: 0, elapsedTime: 0, seekLoopId: -1});
	}

	pauseSeekBar() {
		clearInterval(this.state.seekLoopId);
	}

	seekSong (newSongSeek) {
		let duration = this.props.soundHowl.duration(this.props.playingHowlID) * 1000;

		let percentageSeek = newSongSeek * duration;

		this.setState({seekBarPos: newSongSeek, elapsedTime: percentageSeek});

		console.log(percentageSeek, newSongSeek);

		if (typeof this.props.onSeekChange === 'function') {
			this.props.onSeekChange(newSongSeek);
		}
	}

	playPauseSong (e) {
		if (typeof this.props.onPlayPauseSong === 'function') {
			this.props.onPlayPauseSong();
		}
	}

	previousSong (e) {
		// this.setState({seekBarPos: 0, elapsedTime: 0});

		if (typeof this.props.onPreviousSong === 'function') {
			this.props.onPreviousSong();
		}		
	}

	nextSong (e) {
		// this.setState({seekBarPos: 0, elapsedTime: 0});

		if (typeof this.props.onNextSong === 'function') {
			this.props.onNextSong();
		}		
	}

	getPosition (e, elementID) {
		let pos = ((((e.clientX - document.getElementById(elementID).offsetLeft) / document.getElementById(elementID).offsetWidth)).toFixed(2));
		if(pos > 1) {
			return 1;
		}
		return pos > 0 ? pos : 0;
	}

	onVolumeMouseDown (e) {
		let volumePos = this.getPosition(e, 'volumeControl');
		this.state.volumeDrag = true;
		this.setState({volumeBarPos: volumePos});
		this.changeVolume(volumePos);
	}

	onSeekMouseDown (e) {
		this.state.seekDrag = true;
		this.setState({seekBarPos: this.getPosition(e, 'seekerControl')});
	}

	onMouseMove (e) {
		if (this.state.volumeDrag) {
			let volumePos = this.getPosition(e, 'volumeControl');
			this.setState({volumeBarPos: volumePos});
			this.changeVolume(volumePos);
		} else if (this.state.seekDrag) {
			let seekPos = this.getPosition(e, 'seekerControl');
			this.setState({seekBarPos: seekPos});
		}
	}

	onMouseUp (e) {
		if (this.state.volumeDrag) {
			this.state.volumeDrag = false;
			let volumePos = this.getPosition(e, 'volumeControl');
			this.setState({volumeBarPos: volumePos});
			this.changeVolume(volumePos);
		} else if (this.state.seekDrag) {
			this.state.seekDrag = false;
			let seekPos = this.getPosition(e, 'seekerControl');
			this.setState({seekBarPos: seekPos});
			this.seekSong(seekPos);
		}
	}

	render() {
		let elapsedTime = this.state.elapsedTime / 1000;

		// Minutes and seconds
		let elapsedMins = ~~(elapsedTime / 60);
		let elapsedSecs = ~~(elapsedTime % 60);

		let durationTime = this.state.durationTimeStamp / 1000;

		// Minutes and seconds
		let durationMins = ~~(durationTime / 60);
		let durationSecs = ~~(durationTime % 60);

		return (
			<div className='footer' onMouseUp={this.onMouseUp} onMouseMove={this.onMouseMove}>
				<div className='previousSong'>
					<div onClick={(e) => this.previousSong(e)}/>
				</div>
				<div className='playPauseButton'>
					<div className={this.props.isPlaying ? 'pause' : 'play'} onClick={(e) => this.playPauseSong(e)}/>
				</div>
				<div className='nextSong'>
					<div onClick={(e) => this.nextSong(e)}/>
				</div>
				<div onMouseDown={this.onSeekMouseDown} id='seekerControl' className='seekerArea'>
					<div style={{width: (this.state.seekBarPos * 100) + '%'}} className='seeker'></div>
				</div>
				<div className='timeStamp'>{elapsedMins}:{(elapsedSecs < 10 ? "0" : "") + elapsedSecs}/{durationMins}:{(durationSecs < 10 ? "0" : "") + durationSecs}</div>
				<div onMouseDown={this.onVolumeMouseDown} id='volumeControl' className='volumeArea'>
					<div style={{width: (this.state.volumeBarPos * 100) + '%'}} className='volumeBar'></div>
				</div>
			</div>
		);
	}
}

export default Footer;