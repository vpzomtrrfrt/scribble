import preact from 'preact';
import unorm from 'unorm';

import States from '../common/states';
import wordlist from '../common/words';
import CaptionList from '../common/CaptionList';

import 'preact/devtools';

console.log(wordlist);

function getWord() {
	return unorm.nfc(wordlist[Math.floor(Math.random()*wordlist.length)]).trim();
}

export default class Screen extends preact.Component {
	render(props, state) {
		if(state.gameState == States.NOT_STARTED) {
			return <div>
				not started, {state.players.length} players
				<br />
				{this.state.scores && <center>
					<h1>Scores</h1>
					{Object.keys(this.state.scores).sort((a, b) => this.state.scores[b]-this.state.scores[a]).map(key => {
						return <h3>{this.state.AC.getNickname(key)} - {this.state.scores[key]}</h3>;
					})}
				</center>}
			</div>;
		}
		else if(state.gameState == States.DRAWING) {
			const donePlayers = Object.keys(this.state.drawings).filter(key => this.state.drawings[key].image);
			const blankPlayers = [];
			for(let i = 0; i < state.players.length-donePlayers.length; i++) {
				blankPlayers.push(<div class="smallProfile"></div>);
			}
			return <div>
				Please draw stuff now<br />
				{Object.values(this.state.drawings).filter(value => value.image).length}/{state.players.length}<br />
				{donePlayers.map(key => <img class="smallProfile" src={state.AC.getProfilePicture(state.AC.getUID(key))} />)}
				{blankPlayers}
			</div>;
		}
		else if(state.gameState == States.CAPTION) {
			return <div class="mainAreaThing">
				<div>
					<img src={state.drawings[state.currentPlayer].image}></img>
					<CaptionList width="20%" hide={true} captions={state.drawings[state.currentPlayer].captions} playerCount={state.players.filter(x => x != state.currentPlayer).length} AC={state.AC} />
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
			let data;
			if(this.state.gameState == States.DRAWING) {
				if(id in this.state.drawings) data = this.state.drawings[id].prompt;
				else {
					this.state.drawings[id] = {
						prompt: getWord()
					};
					data = this.state.drawings[id].prompt;
				}
			}
			else if(this.state.gameState == States.CHOOSE) {
				data = this.state.captions;
			}
			this.state.AC.message(id, {type: "state", state: this.state.gameState, stateData: data});
		};
		this.state.AC.onDisconnect = (id) => {
			console.log(id, "disconnected!");
			this.state.players.splice(this.state.players.indexOf(id), 1);
			this.checkState();
		};
		this.state.AC.onMessage = (id, data) => {
			if(data.type == "start") {
				if(this.state.gameState == States.NOT_STARTED) {
					if(this.state.players.length < 2) {
						console.log("can't start, only one player");
						return;
					}
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
				this.checkState();
			}
			else if(data.type == "caption") {
				if(this.state.gameState != States.CAPTION) {
					console.log("can't caption, already captioned");
				}
				this.state.drawings[this.state.currentPlayer].captions[id] = unorm.nfc(data.data).trim();
				this.checkState();
			}
			else if(data.type == "choice") {
				this.state.drawings[this.state.currentPlayer].choices[id] = data.data;
				this.checkState();
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
			this.state.scores = {};
		}
		else if(state == States.CHOOSE) {
			const prompt = this.state.drawings[this.state.currentPlayer].prompt;
			this.state.captions = Object.values(this.state.drawings[this.state.currentPlayer].captions).concat([prompt]);
			const total = this.state.captions.length;
			this.state.captions = this.state.captions.filter((x, i) => this.state.captions.indexOf(x) == i);
			while(this.state.captions.length < total) {
				const word = getWord();
				if(this.state.captions.indexOf(word) > -1) continue;
				this.state.captions.push(word);
			}
			this.state.captions = this.state.captions.sort(()=>Math.random()-0.5);
			console.log(this.state.captions);
		}
		else if(state == States.REVEAL) {
			const tr = {};
			this.state.captions.forEach(caption => {
				let fools = 0;
				const choices = this.state.drawings[this.state.currentPlayer].choices;
				let correct = caption == this.state.drawings[this.state.currentPlayer].prompt;
				for(let player in choices) {
					const choice = choices[player];
					if(choice == caption) {
						fools++;
						if(correct) {
							this.state.scores[player] = (this.state.scores[player] || 0) + 1;
						}
					}
				}
				if(!correct) {
					const captions = this.state.drawings[this.state.currentPlayer].captions;
					for(let player in captions) {
						if(captions[player] == caption) {
							this.state.scores[player] = (this.state.scores[player] || 0) + fools;
							if(this.state.drawings[this.state.currentPlayer].choices[player] == caption) this.state.scores[player]--;
						}
					}
				}
				else {
					const player = this.state.currentPlayer;
					this.state.scores[player] = (this.state.scores[player] || 0) + fools - 1;
				}
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
				data = getWord();
				this.state.drawings[player] = {
					prompt: data
				};
			}
			else if(state == States.CAPTION) {
				if(player == this.state.currentPlayer) data = true;
			}
			else if(state == States.CHOOSE) {
				data = this.state.captions;
			}
			this.state.AC.message(player, {type: "state", state: state, stateData: data});
		});
	}

	checkState() {
		if(this.state.gameState == States.DRAWING) {
			if(Object.values(this.state.drawings).filter(value => {
				return value.captions;
			}).length >= this.state.players.length) {
				this.setState({currentPlayer: this.state.players[Math.floor(Math.random()*this.state.players.length)]});
				this.enterState(States.CAPTION);
				return;
			}
		}
		if(this.state.gameState == States.CAPTION) {
			if(Object.keys(this.state.drawings[this.state.currentPlayer].captions).length >= this.state.players.filter(x => x != this.state.currentPlayer).length) {
				this.enterState(States.CHOOSE);
				return;
			}
		}
		if(this.state.gameState == States.CHOOSE) {
			if(Object.keys(this.state.drawings[this.state.currentPlayer].choices).length >= this.state.players.length) {
				this.enterState(States.REVEAL);
				return;
			}
		}
		this.setState({});
	}
}
