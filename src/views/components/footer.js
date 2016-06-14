import { Component } from 'react'

class Footer extends Component  {
	constructor(props) {
		super(props);

		this.state = {
			volumeDrag: false,
			volumeBarPos: 0.5
		};

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);


	}

	changeVolume (newVoume) {
		if (typeof this.props.onChange === 'function') {
			this.props.onChange(newVoume);
		}
	}

	playPauseSong (e) {
		if (typeof this.props.onPlayPauseSong === 'function') {
			this.props.onPlayPauseSong();
		}		
	}

	previousSong (e) {
		if (typeof this.props.onPreviousSong === 'function') {
			this.props.onPreviousSong();
		}		
	}

	nextSong (e) {
		if (typeof this.props.onNextSong === 'function') {
			this.props.onNextSong();
		}		
	}

	getVolumePosition (e) {
		let volume = ((((e.clientX - document.getElementById('volumeControl').offsetLeft) / document.getElementById('volumeControl').offsetWidth)).toFixed(2));
		if(volume > 1) {
			return 1;
		}
		return volume > 0 ? volume : 0;
	}

	onMouseDown (e) {
		this.state.volumeDrag = true;
		// $('.sound').removeClass('muted');
		console.log(this.getVolumePosition(e));
		this.setState({volumeBarPos: this.getVolumePosition(e)});
		this.changeVolume(this.getVolumePosition(e));
	}

	onMouseMove (e) {
		if (this.state.volumeDrag) {
			this.setState({volumeBarPos: this.getVolumePosition(e)});
			this.changeVolume(this.getVolumePosition(e));				
		}
	}

	onMouseUp (e) {
		if (this.state.volumeDrag) {
			this.state.volumeDrag = false;
			this.setState({volumeBarPos: this.getVolumePosition(e)});
			this.changeVolume(this.getVolumePosition(e));	
		}
	}

	render () {
				return ( 
					<div className='footer' onMouseUp={this.onMouseUp} onMouseMove={this.onMouseMove}>
						<div className='previousSong'>
							<div onClick={(e) => this.previousSong(e)} />
						</div>					
						<div className='playPauseButton'>
							<div className={this.props.isPlaying ? 'pause' : 'play'} onClick={(e) => this.playPauseSong(e)} />
						</div>
						<div className='nextSong'>
							<div onClick={(e) => this.nextSong(e)} />
						</div>
						<div onMouseDown={this.onMouseDown} id='volumeControl' className='volumeArea'>
							<span style={{width: (this.state.volumeBarPos*100)+'%'}} className='volumeBar'></span>
						</div>
					</div>
				);
	}
}

export default Footer;