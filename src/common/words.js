const text = require('raw-loader!../wordlist.txt');
module.exports = text.split("\n").slice(0, -1);
