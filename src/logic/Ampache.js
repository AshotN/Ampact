'use strict';

const crypto = require('crypto');
const https = require('https');
const request = require('request');
import {Song} from './Song';
import {Album} from './Album';
import {Playlist} from '../logic/Playlist';

/**
 * @class Ampache
 */
export class Ampache {

  constructor(username, apikey, server = 'localhost') {
    this._username = username;
    this._apikey = apikey;
    this._server = server;
    this._authCode = null;

    this.getAllAlbums = this.getAllAlbums.bind(this);
    this.getAllSongs = this.getAllSongs.bind(this);

  }


  get username() {
    return this._username;
  }

  get apikey() {
    return this._apikey;
  }

  get server() {
    return this._server;
  }

  get authCode() {
    return this._authCode;
  }

  set authCode(value) {
    //Some sort of validation
    this._authCode = value;
  }

  /**
   * @callback handshakeSongsCallback
   * @param {null|string} errorCode - The code returned by the Ampache server
   * @param {string|null} authKey - Key used for all future interactions with the API
   */
  /**
   * Generates and saves an auth key with the server
   * @param {handshakeSongsCallback} cb - The callback that handles the response.
   * */
  handshake(cb) {
    let time = Math.round((new Date()).getTime() / 1000);
    const key = crypto.createHash('sha256').update(this.apikey).digest('hex');
    const passphrase = crypto.createHash('sha256').update(time + key).digest('hex');
    console.log(`${this.server}/server/json.server.php?action=handshake&user=${this.username}&timestamp=${time}&auth=${passphrase}&version=350001`);
    request({
      url: `${this.server}/server/json.server.php?action=handshake&user=${this.username}&timestamp=${time}&auth=${passphrase}&version=350001`,
      timeout: 500
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {

        let JSONData = JSON.parse(body);

        if (JSONData.error) {
          return cb(JSONData.error, null);
        }
        else if (JSONData.auth) {
          this.authCode = JSONData.auth;
          return cb(null, JSONData.auth);
        }

      }
      else {
        return cb(error, null);
      }

    });


  }

  getArtist(artistID, cb) {
    console.log(artistID, `${this.server}/server/json.server.php?action=artist&filter=${artistID}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=artist&filter=${artistID}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          let errorCode = JSONData.error.code;
          return cb(errorCode, null);
        }
        else {

          cb(null, JSONData[0].artist);

        }
      }

    });
  }

  getAlbum(albumID, cb) {
    console.log(albumID, `${this.server}/server/json.server.php?action=album&filter=${albumID}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=album&filter=${albumID}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          let errorCode = JSONData.error.code;
          return cb(errorCode, null);
        }
        else {

          cb(null, JSONData[0].album);

        }
      }

    });
  }

  /**
   * Gets all Albums from the Server
   * @return {Promise.<Albums>}
   */
  getAllAlbums(cb) {
    console.log(`${this.server}/server/json.server.php?action=albums&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=albums&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          let errorCode = parseInt(JSONData.error.code);
          return cb(errorCode, null);
        }
        else {
          let albums = new Map();

          JSONData.forEach((entry) => {
            let albumData = entry.album;
            let album = new Album(albumData.id, albumData.name, albumData.artist.name, albumData.artist.id, albumData.tracks, albumData.art);
            albums.set(parseInt(album.ID), album);
          });
          return cb(null, albums);
        }
      }
    });
  }
  /**
   * @callback getAllSongsCallback
   * @param {null|string} errorCode - The code returned by the Ampache server
   * @param {Map.Song|Null} allSongs
   */
  /**
   * Gets all Songs from the Ampache Server
   * @param {getAllSongsCallback} cb - The callback that handles the response.
   * */
  getAllSongs(cb) {
    console.log(`${this.server}/server/json.server.php?action=songs&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=songs&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var JSONData = JSON.parse(body);
        if (JSONData.error != null) {
          var errorCode = JSONData.error.code;
          return cb(errorCode, null);
        }
        else {
          let songs = [];

          JSONData.forEach(function (entry) {
            let songData = entry.song;
            let song = new Song(songData.id, songData.album.name, songData.album.id, songData.artist.name, songData.artist.id, songData.title, songData.mime, songData.bitrate, songData.url, false, songData.time);
            // songs.set(parseInt(song.ID), song);
            songs.push(song);
          });
          cb(null, songs);

        }
      }
    });
  }

  getSong(AmpacheID, cb) {
    console.log(AmpacheID, `${this.server}/server/json.server.php?action=song&filter=${AmpacheID}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=song&filter=${AmpacheID}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          var errorCode = JSONData.error.code;
          return cb(errorCode, null);
        }
        else {

          let song = new Song(JSONData[0].song);

          cb(null, song);

        }
      }

    });

  }

  getAllPlaylists(cb) {
    console.log(`${this.server}/server/json.server.php?action=playlists&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=playlists&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          let errorCode = JSONData.error.code;
          return cb(errorCode, null);
        }
        else {
          let playlists = new Map();

          JSONData.forEach((playlist) => {
            let ourPlaylist = new Playlist(playlist.playlist.id, playlist.playlist.name);
            playlists.set(parseInt(playlist.playlist.id), ourPlaylist);
          });
          return cb(null, playlists);
        }
      }
    });
  }

  getPlaylist(PlaylistID, cb) {
    console.log(`${this.server}/server/json.server.php?action=playlist&filter${PlaylistID}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=playlists&filter${PlaylistID}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          let errorCode = JSONData.error.code;
          return cb(errorCode, null);
        }
        else {
          cb(null, JSONData[0].playlist);
        }
      }

    });
  }

  getPlaylistSongs(playListID, cb) {
    console.log(playListID, `${this.server}/server/json.server.php?action=playlist_songs&filter=${playListID}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=playlist_songs&filter=${playListID}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          return cb(JSONData.error, null);
        }
        else {

          let songs = new Map();

          JSONData.forEach(function (entry) {
            let songData = entry.song;
            let song = new Song(songData.id, songData.album.name, songData.album.id, songData.artist.name, songData.artist.id, songData.title, songData.mime, songData.bitrate, songData.url, false, songData.time);
            songs.set(songData.playlisttrack, song);
            //songs.push(song);
          });
          // cb(null, songs);
          return cb(null, songs);

        }
      }

    });
  }

  getAlbumSongs(albumID, cb) {
    console.log(albumID, `${this.server}/server/json.server.php?action=album_songs&filter=${albumID}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=album_songs&filter=${albumID}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          return cb(JSONData.error, null);
        }
        else {
          let songs = [];

          JSONData.forEach(function (entry) {
            let songData = entry.song;
            let song = new Song(songData.id, songData.album.name, songData.album.id, songData.artist.name, songData.artist.id, songData.title, songData.mime, songData.bitrate, songData.url, false, songData.time);
            // songs.set(songData.track, song);
            songs.push(song);
          });
          return cb(null, songs);
        }
      }
    });
  }

  getArtistSongs(artistID, cb) {
    console.log(`${this.server}/server/json.server.php?action=artist_songs&filter=${artistID}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=artist_songs&filter=${artistID}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          return cb(JSONData.error, null);
        }
        else {
          let songs = [];

          JSONData.forEach(function (entry) {
            let songData = entry.song;
            let song = new Song(songData.id, songData.album.name, songData.album.id, songData.artist.name, songData.artist.id, songData.title, songData.mime, songData.bitrate, songData.url, false, songData.time);
            // songs.set(songData.id, song);
            songs.push(song);
          });
          return cb(null, songs);
        }
      }
    });
  }

  addSongToPlaylist(playListID, AmpacheSongID, cb) {
    console.log(playListID, `${this.server}/server/json.server.php?action=playlist_add_song&filter=${playListID}&song=${AmpacheSongID}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=playlist_add_song&filter=${playListID}&song=${AmpacheSongID}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          //TODO: ERROR HANDLING
        }
        else {

          cb(null, "Good");

        }
      }

    });
  }

  removeSongFromPlaylist(playListID, PlaylistTrackNumber, cb) {
    console.log(playListID, `${this.server}/server/json.server.php?action=playlist_remove_song&filter=${playListID}&track=${PlaylistTrackNumber}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=playlist_remove_song&filter=${playListID}&track=${PlaylistTrackNumber}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          //TODO: ERROR HANDLING
          console.err(err);
        }
        else {

          cb(null, "Good");

        }
      }

    });
  }

  searchSongs(searchTerm, cb) {
    console.log(`${this.server}/server/json.server.php?action=search_songs&filter=${searchTerm}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=search_songs&filter=${searchTerm}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          let errorCode = JSONData.error.code;
          return cb(errorCode, null);
        }
        else {
          let songs = [];

          JSONData.forEach(function (entry) {
            let songData = entry.song;
            let song = new Song(songData.id, songData.album.name, songData.album.id, songData.artist.name, songData.artist.id, songData.title, songData.mime, songData.bitrate, songData.url, false, songData.time);
            // songs.set(songData.id, song);
            songs.push(song);
          });
          cb(null, songs);

        }
      }
    });
  }

  createPlaylist(playlistName, cb) {
    console.log(playlistName, `${this.server}/server/json.server.php?action=playlist_create&name=${playlistName}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=playlist_create&name=${playlistName}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          let error = new Error(JSONData.error.message, JSONData.error.code);
          return cb(error, null);
        }
        else {
          console.log(JSONData);
          cb(null, parseInt(JSONData[0].playlist.id));
        }
      }

    });
  }

  deletePlaylist(playlistID, cb) {
    console.log(playlistID, `${this.server}/server/json.server.php?action=playlist_delete&filter=${playlistID}&auth=${this.authCode}`);
    request(`${this.server}/server/json.server.php?action=playlist_delete&filter=${playlistID}&auth=${this.authCode}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let JSONData = JSON.parse(body);

        if (JSONData.error != null) {
          let error = new Error(JSONData.error.message, JSONData.error.code);
          return cb(error, null);
        }
        else {
          console.log(JSONData);
          cb(null, JSONData.message);
        }
      }

    });
  }

}
