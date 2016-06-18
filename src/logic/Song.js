'use strict'

export class Song {

	constructor(songArray) {

		//TODO: Some validation

		console.log(songArray);

		this._ampacheID = songArray.id;
		this._Album = songArray.album.name;
		this._Artist = songArray.artist.name;
		this._Title = songArray.title;
		this._MIME = songArray.mime;
		this._Bitrate = songArray.bitrate;
		this._URL = songArray.url;
		this._Favorite = false;
		this._PlaylistTrackNumber = -1;
	}

	get ID () {
		return this._ampacheID;
	}

	get Album () {
		return this._Album
	}

	get Artist () {
		return this._Artist;
	}

	get Title () {
		return this._Title;
	}

	get Mime () {
		return this._MIME;
	}

	get Bitrate () {
		return this._Bitrate;
	}

	get URL () {
		return this._URL;
	}

	get Favorite () {
		return this._Favorite;
	}

	set Favorite (value) {
		this._Favorite = value;
	}

	get PlaylistTrackNumber () {
		return this._PlaylistTrackNumber;
	}

	set PlaylistTrackNumber (value) {
		this._PlaylistTrackNumber = value;
	}

}
