import preact from 'preact';
import States from '../common/states';

export default class Screen extends preact.Component {
	render(props, state) {
		if(state.gameState == States.NOT_STARTED) {
			return <div>not started, {state.players.length} players</div>;
		}
		else if(state.gameState == States.DRAWING) {
			return <div>
				Please draw stuff now<br />
				{Object.keys(this.state.drawings).length}/{state.players.length}
				</div>;
		}
		else if(state.gameState == States.CAPTION) {
			return <div style="display: flex; align-items: center; flex-direction: column; justify-content: space-around; height: 100%">
				<div style="display: inline-flex">
					<img src={state.drawings[state.currentPlayer]}></img>
				</div>
			</div>;
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
			this.state.AC.message(id, {type: "state", state: this.state.gameState});
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
			else if(data.type == "drawing") {
				this.state.drawings[id] = data.data;
				if(Object.keys(this.state.drawings).length >= this.state.players.length) {
					this.enterState(States.CAPTION);
				}
				else {
					this.setState({});
				}
			}
			else {
				console.log("Unrecognized command:", data);
			}
		};
		this.state.gameState = States.NOT_STARTED;
	}

	enterState(state) {
		this.setState({gameState: state});
		if(state == States.DRAWING) {
			this.state.drawings = {};
		}
		else if(state == States.CAPTION) {
			this.setState({currentPlayer: this.state.players[Math.floor(Math.random()*this.state.players.length)]});
		}
		this.state.players.forEach(player => {
			let data;
			if(state == States.DRAWING) {
				data = "a donkey";
			}
			this.state.AC.message(player, {type: "state", state: state, stateData: data});
		});
	}
}
