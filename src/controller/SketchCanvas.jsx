import preact from 'preact';

export default class SketchCanvas extends preact.Component {
	render(props, state) {
		return <canvas width="1200" height="1200" style="border: 2px solid grey; width: 90%"></canvas>;
	}
	offset(canvas, coords) {
		const rect = canvas.getBoundingClientRect();
		console.log(rect);
		const scale = canvas.width/rect.width;
		return {
			x: (coords.x-rect.left)*scale,
			y: (coords.y-rect.top)*scale
		};
	}
	componentDidMount() {
		const canvas = this.base;
		if(this.props.bind) this.props.bind(canvas);
		const ctx = canvas.getContext('2d');

		function drawLine(prev2, prev, now) {
			ctx.beginPath();
			ctx.lineJoin = "round";
			ctx.moveTo(prev2.x, prev2.y);
			ctx.lineTo(prev.x, prev.y);
			ctx.lineTo(now.x, now.y);
			ctx.lineWidth = 16;
			ctx.strokeColor = "black";
			ctx.stroke();
			console.log(now);
		}

		const oldTouches = {};
		const olderTouches = {};
		canvas.ontouchstart = (evt) => {
			const touches = evt.changedTouches;
			for(let i = 0; i < touches.length; i++) {
				const touch = touches[i];
				const id = touch.identifier;
				olderTouches[id] = oldTouches[id] = this.offset(canvas, {x: touch.pageX, y: touch.pageY});
				drawLine(oldTouches[id], oldTouches[id], oldTouches[id]);
			}
		};
		canvas.ontouchmove = (evt) => {
			const touches = evt.changedTouches;
			for(let i = 0; i < touches.length; i++) {
				const touch = touches[i];
				const id = touch.identifier;
				const prev2 = olderTouches[id];
				const prev = olderTouches[id] = oldTouches[id];
				const now = oldTouches[id] = this.offset(canvas, {x: touch.pageX, y: touch.pageY});
				drawLine(prev2, prev, now);
			}
		};
	}
}
