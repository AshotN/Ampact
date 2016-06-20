'use strict'

export class Playlist {

	constructor(ampachePlaylistID, Name) {

		//TODO: Some validation

		this._ampachePlaylistID = ampachePlaylistID;
		this._name = Name;
		this._songs = [];
	}

	get ID () {
		return this._ampachePlaylistID;
	}

	get Name () {
		return this._name;
	}

	get Songs () {
		return this._songs
	}

	set Songs (arrayOfSongIds) {
		//TODO: Validation
		this._songs = arrayOfSongs;
	}

	pushSingleSongID (songID) {
		this._songs.push(songID);
	}


}
