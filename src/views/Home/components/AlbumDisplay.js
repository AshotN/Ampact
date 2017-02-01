import {Component} from 'react'
import {Link} from 'react-router';

class AlbumDisplay extends Component {
  constructor(props) {
	super(props);
  }

  render() {

	return (
		<div className='albumDisplay'>
		  <Link to={{pathname: `/album/${this.props.Album.ID}`}}>
			<div className='album'>
			  <img src={this.props.Album.CoverArt} />
			  <div className='title'>{this.props.Album.Title} - {this.props.Album.ID}</div>
			</div>
		  </Link>
		</div>
	)
  }
}

export default AlbumDisplay;