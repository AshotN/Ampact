const Combokeys = require("combokeys");
var combokeys = new Combokeys(document.documentElement);

module.exports = function(opts) {
	console.log("Initailized Shortcuts", opts);
	combokeys.bind(['space', 'ctrl+k'], (e) => {
		opts.playPauseSong();
		// return false to prevent default browser behavior
		// and stop event from bubbling
		return false;
	}, 'keyup');
};

