import React from 'react'
import AlbumDisplay from './components/AlbumDisplay'
export default class HomeView extends React.Component {

  constructor(props, context) {
	super(props, context);
	console.log("con", context)

	this.state = {
	  albumsForHome: context.albumsForHome
	};
  }

  componentWillReceiveProps(nextProps, nextContext) {
	console.log("NEXT", nextContext, this.state);
	if (this.state.albumsForHome.length === 0) {
	  this.setState({albumsForHome: nextContext.albumsForHome})
	}
  }


  render() {
	console.log(this.context);
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
				this.state.albumsForHome.map((album, index) => {
				  return <AlbumDisplay Album={album} key={index}/>
				})
			  }
			</div>
		  </div>
		</div>
	);
  }
}
// Access parent context by defining contextTypes
HomeView.contextTypes = {
  albumsForHome: React.PropTypes.array
};

