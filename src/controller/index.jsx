import preact from 'preact';

require('../common/main.scss');

import Controller from './Controller';

console.log("Hi, I'm the controller!");

window.init = function() {
	preact.render(<Controller />, document.body);
};
