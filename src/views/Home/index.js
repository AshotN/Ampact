import React from 'react'
import AlbumDisplay from './components/AlbumDisplay'
export default class HomeView extends React.Component {

  constructor(props) {
	super(props);
  }

  render() {
	console.log(this.props);
	return (
		<div>
		  <div className='center'>Home</div>

		  <div>
			<div className='center'>Artists</div>
		  </div>
		  <div>
			<div className='center albumTitle'>Albums</div>
			<div className='albumDisplayContainer'>
			  {
				this.props.albumsForHome.map((album, index) => {
				  return <AlbumDisplay Album={album} key={index}/>
				})
			  }
			</div>
		  </div>
		</div>
	);
  }
}
// Verify Prop Types
HomeView.propTypes = {
  albumsForHome: React.PropTypes.array
};

