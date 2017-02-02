import React from 'react'
import AlbumDisplay from './components/AlbumDisplay'
export default class HomeView extends React.Component {

  constructor(props) {
	super(props);
  }

  render() {
    let AlbumDisplays = [];
	this.props.albumsForHome.forEach((album, index) => {
	  console.log(index, album);
	  if(album !== undefined) {
		AlbumDisplays.push(<AlbumDisplay Album={album} key={index}/>);
	  }
	});
	console.log(this.props.allAlbums);
	return (
		<div>
		  <div className='center'>Home</div>

		  <div>
			<div className='center'>Artists</div>
		  </div>
		  <div>
			<div className='center albumTitle'>Albums</div>
			<div className='albumDisplayContainer'>
			  {AlbumDisplays};
			</div>
		  </div>
		</div>
	);
  }
}
// Verify Prop Types
HomeView.propTypes = {
  albumsForHome: React.PropTypes.object
};

