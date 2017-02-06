'use strict';

export class Playlist {

	constructor(ampachePlaylistID, Name) {

		//TODO: Some validation

		this._ampachePlaylistID = ampachePlaylistID;
		this._name = Name;
		this._songs = new Map();
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

	clearSongs () {
	  this._songs = new Map();
	}

	set Songs(arrayOfSongIDs) {
	  //TODO: Validation
	  this._songs = arrayOfSongIDs;
	}

	pushSingleSong (songID, trackID) {
		this._songs.set(songID, trackID);
	}

	removeSingleSong(songID) {
	  this._songs.delete(songID);
	}


}
