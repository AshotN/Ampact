import {Component} from 'react'

class AlbumDisplay extends Component {
  constructor(props) {
	super(props);

	this.state = {};


  }

  render() {

	return (
		<div className='albumDisplay'>
		  <div className='album'>
			<img src={this.props.Album.CoverArt}/>
			<div className='title'>{this.props.Album.Title}</div>
		  </div>
		</div>
	)
  }
}

export default AlbumDisplay;