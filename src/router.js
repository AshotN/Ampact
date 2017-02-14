import React from 'react';
import { render } from 'react-dom';
import { Router, IndexRoute, Route, hashHistory } from 'react-router';
import App from './views/App';
import Playlist from './views/Playlist';
import Album from './views/Album';
import Artist from './views/Artist';
import Search from './views/Search';
import Home from './views/Home';

render(
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="/playlist/:playlistID" component={Playlist} />
      <Route path="/album/:albumID" component={Album} />
      <Route path="/artist/:artistID" component={Artist} />
      <Route path="/search/:searchTerm" component={Search} />
    </Route>
  {/*<Route path="*" component={NoMatch} />*/}
  </Router>,
  document.getElementById('root')
);
