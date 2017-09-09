import preact from 'preact';
import States from '../common/states';
import wordlist from '../common/words';
import CaptionList from '../common/CaptionList';

import 'preact/devtools';

console.log(wordlist);

export default class Screen extends preact.Component {
	render(props, state) {
		if(state.gameState == States.NOT_STARTED) {
			return <div>not started, {state.players.length} players</div>;
		}
		else if(state.gameState == States.DRAWING) {
			return <div>
				Please draw stuff now<br />
				{Object.values(this.state.drawings).filter(value => value.image).length}/{state.players.length}
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
		else if(state.gameState == States.REVEAL) {
			return <div>
				{Object.keys(state.results).map(key => {
					const value = state.results[key];
					return <h1>{value.correct ? '✅' : '❌'} {key} - {value.fools}</h1>;
				})}
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
				if(this.state.gameState == States.NOT_STARTED) {
					this.enterState(States.DRAWING);
				}
				else if(this.state.gameState == States.REVEAL) {
					const options = [];
					for(let key in this.state.drawings) {
						if(this.state.drawings[key].captions && Object.keys(this.state.drawings[key].captions).length < 1) options.push(key);
					}
					if(options.length < 1) {
						this.enterState(States.NOT_STARTED);
						this.state.AC.showAd();
					}
					else {
						this.setState({currentPlayer: options[Math.floor(Math.random()*options.length)]});
						this.enterState(States.CAPTION);
					}
				}
				else {
					console.log("can't start, already started");
				}
			}
			else if(data.type == "drawing") {
				if(this.state.gameState != States.DRAWING) {
					console.log("can't draw, already drawn");
					return;
				}
				this.state.drawings[id] = {prompt:(this.state.drawings[id]||{prompt:''}).prompt,image:data.data,captions:{},choices:{}};
				if(Object.values(this.state.drawings).filter(value => {
					return value.captions;
				}).length >= this.state.players.length) {
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
			else if(data.type == "choice") {
				this.state.drawings[this.state.currentPlayer].choices[id] = data.data;
				if(Object.keys(this.state.drawings[this.state.currentPlayer].choices).length >= this.state.players.length) {
					this.enterState(States.REVEAL);
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
		else if(state == States.CHOOSE) {
			const prompt = this.state.drawings[this.state.currentPlayer].prompt;
			this.state.captions = Object.values(this.state.drawings[this.state.currentPlayer].captions).filter(x => x != prompt).concat([prompt]).sort(()=>Math.random()-0.5);
			console.log(this.state.captions);
		}
		else if(state == States.REVEAL) {
			const tr = {};
			this.state.captions.forEach(caption => {
				let fools = 0;
				const choices = this.state.drawings[this.state.currentPlayer].choices;
				for(let player in choices) {
					const choice = choices[player];
					if(choice == caption) fools++;
				}
				let correct = caption == this.state.drawings[this.state.currentPlayer].prompt;
				tr[caption] = {
					correct,
					fools
				};
			});
			this.setState({results: tr});
		}
		this.state.players.forEach(player => {
			let data;
			if(state == States.DRAWING) {
				data = wordlist[Math.floor(Math.random()*wordlist.length)];
				this.state.drawings[player] = {
					prompt: data
				};
			}
			else if(state == States.CHOOSE) {
				data = this.state.captions;
			}
			this.state.AC.message(player, {type: "state", state: state, stateData: data});
		});
	}
}
