'use strict'

/**
 * Class representing a Song
 * @class
 *
 */
export class Song {

  /**
   * Create a Song object.
   * @param {Number} ampacheID - ID Number the server uses for the Song
   * @param {String} AlbumName
   * @param {Number} albumID - ID Number the server uses for the Album
   * @param {String} ArtistName
   * @param {Number} artistID - ID Number the server uses for the Artist
   * @param {String} Title
   * @param {String} MIME - MIME Type of the Song
   * @param {Number} Bitrate
   * @param {String} URL - URL needed to play the song
   * @param {Boolean} Favorite
   * @param {Number} Duration
   */
  constructor(ampacheID, AlbumName, albumID, ArtistName, artistID, Title, MIME, Bitrate, URL, Favorite, Duration) {

	//TODO: Some validation

	this._ampacheID = ampacheID;
	this._Album = AlbumName;
	this._albumID = albumID;
	this._Artist = ArtistName;
	this._artistID = artistID;
	this._Title = Title;
	this._MIME = MIME;
	this._Bitrate = Bitrate;
	this._URL = URL;
	this._Favorite = Favorite;
	this._Duration = Duration;
  }

  /**
   * Get the ampacheID of the Song.
   * @return {number} The ampacheID.
   */
  get ID() {
	return this._ampacheID;
  }

  get Album() {
	return this._Album;
  }

  get albumID() {
	return this._albumID;
  }

  get Artist() {
	return this._Artist;
  }

  get artistID() {
	return this._artistID;
  }

  get Title() {
	return this._Title;
  }

  get Mime() {
	return this._MIME;
  }

  get Bitrate() {
	return this._Bitrate;
  }

  get URL() {
	return this._URL;
  }

  get Favorite() {
	return this._Favorite;
  }

  set Favorite(value) {
	this._Favorite = value;
  }

  get Duration() {
	return this._Duration;
  }
}
