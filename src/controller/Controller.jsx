import preact from 'preact';
import linkState from 'linkstate';
import 'preact/devtools';

import States from '../common/states';

import SketchCanvas from './SketchCanvas';
import CaptionList from '../common/CaptionList';

export default class Controller extends preact.Component {
	render(props, state) {
		if(state.gameState == States.NOT_STARTED) {
			return <div>
				not started
			<br />
			<button onClick={() => {
				state.AC.message(AirConsole.SCREEN, {
					type: "start"
				});
			}}>Start</button>
				</div>;
		}
		else if(state.gameState == States.DRAWING) {
			return <div>
				Please draw "{state.stateData}"
				<br />
				<SketchCanvas bind={linkState(this, 'canvas')} />
				<br />
				<button onClick={this.submitDrawing.bind(this)}>Submit</button>
			</div>;
		}
		else if(state.gameState == States.CAPTION) {
			if(this.state.done) {
				return <div>Please wait for the other players</div>;
			}
			return <div>
				Look at the screen.  What do you see?
				<br />
				<input type="text" onInput={linkState(this, 'text')} />
				<br />
				<button onClick={this.submitCaption.bind(this)}>Submit</button>
			</div>;
		}
		else if(state.gameState == States.CHOOSE) {
			if(this.state.done) {
				return <div>Please wait for the other players</div>;
			}
			return <div>
				<CaptionList width="100%" captions={state.stateData} />
			</div>;
		}
		return <div>wut</div>;
	}

	submitDrawing() {
		const drawing = this.state.canvas.toDataURL('image/png');
		this.state.AC.message(AirConsole.SCREEN, {
			type: 'drawing',
			data: drawing
		});
	}

	submitCaption() {
		this.state.AC.message(AirConsole.SCREEN, {
			type: 'caption',
			data: this.state.text
		});
		this.state.done = true;
	}

	constructor() {
		super();
		this.state.AC = new AirConsole();
		this.state.AC.onMessage = (from, data) => {
			console.log(data);
			if(from == AirConsole.SCREEN) {
				if(data.type == "state") this.setState({gameState: data.state, stateData: data.stateData, done: false});
			}
		};
	}
}
