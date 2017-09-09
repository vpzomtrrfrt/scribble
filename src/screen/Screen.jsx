import preact from 'preact';
import States from '../common/states';

export default class Screen extends preact.Component {
	render(props, state) {
		if(state.gameState == States.NOT_STARTED) {
			return <div>not started, {state.playerCount} players</div>;
		}
		return <div>wut</div>;
	}

	constructor() {
		super();
		this.state.playerCount = 0;
		this.state.AC = new AirConsole();
		this.state.AC.onConnect = (id) => {
			console.log(id, "connected!");
			this.setState({
				playerCount: this.state.playerCount+1
			});
			this.state.AC.message(id, {type: "state", data: this.state.gameState});
		};
		this.state.AC.onDisconnect = (id) => {
			console.log(id, "disconnected!");
			this.setState({
				playerCount: this.state.playerCount-1
			});
		};
		this.state.gameState = States.NOT_STARTED;
	}
}
