import preact from 'preact';
import States from '../common/states';
import CaptionList from '../common/CaptionList';

import 'preact/devtools';

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
			return <div class="mainAreaThing">
				<div>
					<img src={state.drawings[state.currentPlayer].image}></img>
					<CaptionList width="20%" hide={true} captions={state.drawings[state.currentPlayer].captions} playerCount={state.players.length} />
				</div>
			</div>;
		}
		else if(state.gameState == States.CHOOSE) {
			return <div class="mainAreaThing">
				<div>
					<img src={state.drawings[state.currentPlayer].image}></img>
					<CaptionList width="20%" captions={state.captions} />
				</div>
				<br />
				<h1>{Object.keys(state.drawings[state.currentPlayer].choices).length}/{state.players.length}</h1>
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
				if(this.state.gameState != States.DRAWING) {
					console.log("can't draw, already drawn");
					return;
				}
				this.state.drawings[id] = {image:data.data,captions:{},choices:{}};
				if(Object.keys(this.state.drawings).length >= this.state.players.length) {
					this.setState({currentPlayer: this.state.players[Math.floor(Math.random()*this.state.players.length)]});
					this.enterState(States.CAPTION);
				}
				else {
					this.setState({});
				}
			}
			else if(data.type == "caption") {
				if(this.state.gameState != States.CAPTION) {
					console.log("can't caption, already captioned");
				}
				this.state.drawings[this.state.currentPlayer].captions[id] = data.data;
				if(Object.keys(this.state.drawings[this.state.currentPlayer].captions).length >= this.state.players.length) {
					this.enterState(States.CHOOSE);
				}
				else {
					this.setState({});
				}
			}
			else if(data.type == "choose") {
				this.state.drawings[this.state.currentPlayer].choices[id] = data.data;
				this.setState({});
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
		else if(state == States.CHOOSE) {
			this.state.captions = Object.keys(this.state.drawings[this.state.currentPlayer].captions).sort(()=>Math.random()-0.5).map(key => this.state.drawings[this.state.currentPlayer].captions[key]);
			console.log(this.state.captions);
		}
		this.state.players.forEach(player => {
			let data;
			if(state == States.DRAWING) {
				data = "a donkey";
			}
			else if(state == States.CHOOSE) {
				data = this.state.captions;
			}
			this.state.AC.message(player, {type: "state", state: state, stateData: data});
		});
	}
}
