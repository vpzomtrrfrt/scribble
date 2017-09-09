import preact from 'preact';

console.log("Hi, I'm the screen!");

window.init = function() {
	const AC = new AirConsole();
	console.log("init!!");
	AC.onConnect = function(id) {
		console.log(id, "connected!");
	};
	AC.onDisconnect = function(id) {
		console.log(id, "disconnected!");
	};

	preact.render(<div>
		Hello, world!
		</div>, document.body);
};
