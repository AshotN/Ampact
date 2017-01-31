'use strict';

export class Album {

  constructor(albumArray) {

	//TODO: Some validation

	this._ampacheID = albumArray.id;
	this._Title = albumArray.name;
	this._Artist = albumArray.artist.name;
	this._artistID = albumArray.artist.id;
	this._TrackCount = albumArray.tracks;
	this._CoverArt = albumArray.art;
  }

  get ID() {
	return this._ampacheID;
  }

  get Title() {
	return this._Title;
  }

  get Artist() {
	return this._Artist;
  }

  get artistID() {
	return this._artistID;
  }

  get TrackCount() {
	return this._TrackCount;
  }

  get CoverArt() {
	return this._CoverArt;
  }


}
