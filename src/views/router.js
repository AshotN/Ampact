import React from 'react';
import { render } from 'react-dom'
import {Router, IndexRoute, Route, browserHistory} from 'react-router';
import App from './newIndex';
import PlaylistView from './components/PlaylistView/index';
import HomePage from './components/HomePage/index';


export default render((
	<Router history={browserHistory}>
	  <Route path="/home/hego555/WebstormProjects/Ampact/src/index.html" component={App}>
		<IndexRoute component={HomePage} />
		<Route path="/playlist" component={PlaylistView} />
	  </Route>
	  {/*<Route path="*" component={NoMatch} />*/}
	</Router>
), document.getElementById('root'));