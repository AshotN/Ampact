'use strict'

const crypto = require('crypto');
const https = require('https');
const xml2js = require('xml2js')
const request = require('request');

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
		var that = this;

		request(`${this.server}/server/json.server.php?action=handshake&user=${this.username}&timestamp=${time}&auth=${passphrase}&version=350001`, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(body);
				console.log(JSON.parse(body)); // error!!!
			}
		});


		// https.get(`${this.server}/server/json.server.php?action=handshake&user=${this.username}&timestamp=${time}&auth=${passphrase}&version=350001`, (res) => {
		// 	console.log(`${this.server}/server/json.server.php?action=handshake&user=${this.username}&timestamp=${time}&auth=${passphrase}&version=350001`);
		// 	var body = '';
		// 	res.on('data', function(chunk) {
		// 		body += chunk;
				
		// 	});
		// 	res.on('end', function() {
		// 		let data = body;
		// 		console.log(data);

		// 		console.log(JSON.parse(data));
		// 		console.log('ERROR: ' + data.error);

		// 		this.authCode = chunk.auth;
		// 		if(chunk.error != null) {
		// 				var errorCode = chunk.error.code;
		// 				console.log(errorCode);
		// 				cb(errorCode, null);
		// 		}				
		// 		// xml2js.parseString(chunk, {trim: true}, function (err, result) {
		// 		// 	if(result.root.error != null) {
		// 		// 		var errorCode = result.root.error[0].$.code;
		// 		// 		cb(errorCode, null);
		// 		// 	}
		// 		// 	else if(result.root.auth[0] != null){
		// 		// 		console.log(result.root.auth[0]);
		// 		// 		that.authCode = result.root.auth[0];
		// 		// 		cb(null, result.root.auth[0]);
		// 		// 	}
		// 		// });
		// 	});
		// 	res.resume();
		// }).on('error', (e) => {
		// 	alert(`Error: ${e.message}`);
		// });
	}

	getSongs (cb) {
		https.get(`${this.server}/server/xml.server.php?action=songs&auth=${this.authCode}`, (res) => {
			console.log(`${this.server}/server/xml.server.php?action=songs&auth=${this.authCode}`);
			res.on('data', function(chunk) {
				// console.log('BODY: ' + chunk);
				xml2js.parseString(chunk, {trim: true}, function (err, result) {
					console.log(err, result);
					if(result.root.error != null) {
						var errorCode = result.root.error[0].$.code;
						cb(errorCode, null);
					}
					else {
						var songs = [];
						result.root.song.forEach(function(entry) {
							console.log("URL: ",entry.url[0]);
							songs.push({
								ID: entry.$.id,
								Album: entry.album[0]._,
								Artist: entry.artist[0]._,
								Bitrate: entry.bitrate[0],
								Mime: entry.mime[0],
								Title: entry.title[0],
								URL: entry.url[0]
							});
						});
						cb(null, songs);
					}
				});
			});
			res.resume();
		}).on('error', (e) => {
			alert(`Error: ${e.message}`);
		});
	}
}
