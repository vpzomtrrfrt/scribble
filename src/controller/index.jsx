import preact from 'preact';
import 'preact/devtools';

require('../common/main.scss');

import Controller from './Controller';

console.log("Hi, I'm the controller!");

window.init = function() {
	document.body.className += " controller";
	preact.render(<Controller />, document.body);
};
