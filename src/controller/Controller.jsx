import preact from 'preact';
import linkState from 'linkstate';

import States from '../common/states';

import SketchCanvas from './SketchCanvas';

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
		return <div>wut</div>;
	}

	submitDrawing() {
		const drawing = this.state.canvas.toDataURL('image/png');
		this.state.AC.message(AirConsole.SCREEN, {
			type: 'drawing',
			data: drawing
		});
	}

	constructor() {
		super();
		this.state.AC = new AirConsole();
		this.state.AC.onMessage = (from, data) => {
			if(from == AirConsole.SCREEN) {
				if(data.type == "state") this.setState({gameState: data.state, stateData: data.stateData});
			}
		};
	}
}
