import React from 'react'
export default class AlbumView extends React.Component {

  constructor(props) {
	super(props);

	this.ourAlbum = this.props.allAlbums.get(parseInt(this.props.routeParams.albumID));
  }

  render() {
	return (
		<div className='albumView'>
		  <div className='sideInfo'>
			<div className='coverArt'>
			  <img src={this.ourAlbum.CoverArt} />
			</div>
			<div className='title'>
			  {this.ourAlbum.Title} - {this.ourAlbum.ID}
			</div>
		  </div>
		</div>
	);
  }
}
// Verify Prop Types
AlbumView.propTypes = {
  allAlbums: React.PropTypes.object
};

