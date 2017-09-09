import preact from 'preact';

import Screen from './Screen';

console.log("Hi, I'm the screen!");

window.init = function() {
	preact.render(<Screen />, document.body);
};
