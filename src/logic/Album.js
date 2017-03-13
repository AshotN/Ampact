'use strict';

export class Album {

	constructor(ampacheID, Title, Artist, artistID, TrackCount, CoverArt) {

		//TODO: Some validation

		this._ampacheID = ampacheID;
		this._Title = Title;
		this._Artist = Artist;
		this._artistID = artistID;
		this._TrackCount = TrackCount;
		this._CoverArt = CoverArt;
		this._songs = new Map();
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

	get Songs() {
		return this._songs
	}

	set Songs(songs) {
		return this._songs = songs;
	}

	pushSingleSong(songID, trackID) {
		this._songs.set(songID, trackID);
	}

	removeSingleSong(songID) {
		this._songs.delete(songID);
	}

}
