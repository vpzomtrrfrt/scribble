import preact from 'preact';
import States from '../common/states';

export default class Controller extends preact.Component {
	render(props, state) {
		if(state.gameState == States.NOT_STARTED) {
			return <div>not started</div>;
		}
		return <div>wut</div>;
	}

	constructor() {
		super();
		this.state.AC = new AirConsole();
		this.state.AC.onMessage = (from, data) => {
			if(from == AirConsole.SCREEN) {
				if(data.type == "state") this.setState({gameState: data.data});
			}
		};
	}
}
