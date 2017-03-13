'use strict'

export class SongRender {

	constructor(playlistID, songArray) {

		//TODO: Some validation

		this._playlistID = playlistID;
		this._Songs = songArray;
	}

	get playlistID() {
		return this._playlistID;
	}

	get Songs() {
		return this._Songs
	}

}
