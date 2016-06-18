'use strict'

const crypto = require('crypto');
const https = require('https');
const xml2js = require('xml2js')
const request = require('request');
import { Song } from './Song'


export class Ampache {

	constructor(username, apikey, server='localhost') {
		this._username = username;
		this._apikey = apikey;
		this._server = server;
		this._authCode = null;
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



	handshake (cb) {
		var time = Math.round((new Date()).getTime() / 1000);
		const key = crypto.createHash('sha256').update(this.apikey).digest('hex');
		const passphrase = crypto.createHash('sha256').update(time + key).digest('hex');

		console.log(key+':'+passphrase);


		console.log(`${this.server}/server/json.server.php?action=handshake&user=${this.username}&timestamp=${time}&auth=${passphrase}&version=350001`);
		request(`${this.server}/server/json.server.php?action=handshake&user=${this.username}&timestamp=${time}&auth=${passphrase}&version=350001`, (error, response, body) => {
			if (!error && response.statusCode == 200) {

				var JSONData = JSON.parse(body);

				console.log(JSONData);

				if(JSONData.error != null) {
					var errorCode = JSONData.error.code;
					console.log(errorCode);
					return cb(errorCode, null);
				}
				else if(JSONData.auth != null){
					console.log(JSONData.auth);
					this.authCode = JSONData.auth;
					return cb(null, JSONData.auth);
				}

			}
		});


		
	}

	getSongs (cb) {
		console.log(`${this.server}/server/json.server.php?action=songs&auth=${this.authCode}`);
		request(`${this.server}/server/json.server.php?action=songs&auth=${this.authCode}`, (error, response, body) => {
			if (!error && response.statusCode == 200) {
				var JSONData = JSON.parse(body);

				console.log(JSONData);
				if(JSONData.error != null) {
					var errorCode = JSONData.error.code;
					console.log(errorCode);
					return cb(errorCode, null);
				}
				else {
					let songs = [];

					JSONData.forEach(function(entry) {
						// console.log(entry.song);
						let song = new Song(entry.song);
						songs.push(song);
					});
					cb(null, songs);

				}
			}
		});
	}

	getSong (AmpacheID, cb) {
		console.log(AmpacheID, `${this.server}/server/json.server.php?action=song&filter=${AmpacheID}&auth=${this.authCode}`);
		request(`${this.server}/server/json.server.php?action=song&filter=${AmpacheID}&auth=${this.authCode}`, (error, response, body) => {
			if (!error && response.statusCode == 200) {
				var JSONData = JSON.parse(body);
				
				if(JSONData.error != null) {
					var errorCode = JSONData.error.code;
					console.log(errorCode);
					return cb(errorCode, null);
				}
				else {

					console.log(JSONData[0].song);
					let song = new Song(JSONData[0].song);

					cb(null, song);

				}
			}

		});

	}

	getPlaylistSongs (playListID, cb) {
		console.log(playListID, `${this.server}/server/json.server.php?action=playlist_songs&filter=${playListID}&auth=${this.authCode}`);
		request(`${this.server}/server/json.server.php?action=playlist_songs&filter=${playListID}&auth=${this.authCode}`, (error, response, body) => {
			if (!error && response.statusCode == 200) {
				var JSONData = JSON.parse(body);
				
				if(JSONData.error != null) {
					var errorCode = JSONData.error.code;
					console.log(errorCode);
					return cb(errorCode, null);
				}
				else {

					let songs = [];

					JSONData.forEach(function(entry) {
						// console.log(entry.song);
						let song = new Song(entry.song);
						songs.push(song);
					});
					cb(null, songs);

				}
			}

		});		
	}
}
