import { Component } from 'react'

class LoadingSpinner extends Component  {
  constructor(props) {
	super(props);
  }

  render () {
	return (
		<div className="loadingAnimation">
		  <div className="wBall" id="wBall_1">
			<div className="wInnerBall"></div>
		  </div>
		  <div className="wBall" id="wBall_2">
			<div className="wInnerBall"></div>
		  </div>
		  <div className="wBall" id="wBall_3">
			<div className="wInnerBall"></div>
		  </div>
		  <div className="wBall" id="wBall_4">
			<div className="wInnerBall"></div>
		  </div>
		  <div className="wBall" id="wBall_5">
			<div className="wInnerBall"></div>
		  </div>
		</div>
	)
  }
}

export default LoadingSpinner;