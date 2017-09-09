import preact from 'preact';

export default class SketchCanvas extends preact.Component {
	render(props, state) {
		return <canvas></canvas>;
	}
	offset(canvas, coords) {
		const rect = canvas.getBoundingClientRect();
		return {
			x: coords.x-rect.left,
			y: coords.y-rect.top
		};
	}
	componentDidMount() {
		const canvas = this.base;
		if(this.props.bind) this.props.bind(canvas);
		const ctx = canvas.getContext('2d');

		const oldTouches = {};
		canvas.ontouchstart = (evt) => {
			const touches = evt.changedTouches;
			for(let i = 0; i < touches.length; i++) {
				const touch = touches[i];
				const id = touch.identifier;
				oldTouches[id] = this.offset(canvas, {x: touch.pageX, y: touch.pageY});
			}
		};
		canvas.ontouchmove = (evt) => {
			const touches = evt.changedTouches;
			for(let i = 0; i < touches.length; i++) {
				const touch = touches[i];
				const id = touch.identifier;
				const prev = oldTouches[id];
				const now = oldTouches[id] = this.offset(canvas, {x: touch.pageX, y: touch.pageY});
				ctx.beginPath();
				ctx.moveTo(prev.x, prev.y);
				ctx.lineTo(now.x, now.y);
				ctx.lineWith = 4;
				ctx.strokeColor = "black";
				ctx.stroke();
				console.log(now);
			}
		};
	}
}
