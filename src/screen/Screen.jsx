import preact from 'preact';
import States from '../common/states';

export default class Screen extends preact.Component {
	render(props, state) {
		if(state.gameState == States.NOT_STARTED) {
			return <div>not started, {state.players.length} players</div>;
		}
		return <div>wut</div>;
	}

	constructor() {
		super();
		this.state.players = [];
		this.state.AC = new AirConsole();
		this.state.AC.onConnect = (id) => {
			console.log(id, "connected!");
			this.state.players.push(id);
			this.setState({});
			this.state.AC.message(id, {type: "state", data: this.state.gameState});
		};
		this.state.AC.onDisconnect = (id) => {
			console.log(id, "disconnected!");
			this.state.players.splice(this.state.players.indexOf(id), 1);
			this.setState({});
		};
		this.state.AC.onMessage = (id, data) => {
			if(data.type == "start") {
				if(this.state.gameState == States.NOT_STARTED) this.enterState(States.DRAWING);
				console.log("can't start, already started");
			}
			else {
				console.log("Unrecognized command:", data);
			}
		};
		this.state.gameState = States.NOT_STARTED;
	}

	enterState(state) {
		this.setState({gameState: state});
		this.state.players.forEach(player => this.state.AC.message(player, {type: "state", data: state}));
	}
}
