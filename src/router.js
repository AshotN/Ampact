import React from 'react';
import { render } from 'react-dom';
import { Router, IndexRoute, Route, hashHistory } from 'react-router';
import App from './views/App';
import Playlist from './views/Playlist';
import Album from './views/Album';
import Home from './views/Home';

render(
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="/playlist/:playlistID" component={Playlist} />
      <Route path="/album/:albumID" component={Album} />
    </Route>
  {/*<Route path="*" component={NoMatch} />*/}
  </Router>,
  document.getElementById('root')
);
