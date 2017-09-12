import preact from 'preact';
import linkState from 'linkstate';

export default class SketchCanvas extends preact.Component {
	render(props, state) {
		return <div className={'sketchCanvas' + (props.premium ? ' premium' : '')}>
			<canvas width="1200" height="1200" style="border: 2px solid grey; width: 90%; position: relative; left: 5%"></canvas>
			<br />
			<div class="colorChoice">
				{["white", "black", "lightgrey", "lime", "blue", "peru"].map(color => <ColorChoice color={color} selected={color == this.state.color} change={linkState(this, 'color')} />)}
			</div>
			<div class="colorChoice">
				{["yellow", "magenta", "cyan", "saddlebrown", "red", "purple"].map(color => <ColorChoice color={color} selected={color == this.state.color} change={linkState(this, 'color')} locked={!props.premium} AC={props.AC} />)}
			</div>
			<div class="sizeChoice">
				{[16, 32, 64, 128].map(size => <SizeChoice size={size} selected={size == this.state.size} change={linkState(this, 'size')} />)}
			</div>
		</div>;
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
	constructor() {
		super();
		this.state.color = "black";
		this.state.size = 16;
	}
	componentDidMount() {
		const canvas = this.base.getElementsByTagName('canvas')[0];
		if(this.props.bind) this.props.bind(canvas);
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const drawLine = (prev2, prev, now) => {
			ctx.beginPath();
			ctx.lineJoin = "round";
			ctx.moveTo(prev2.x, prev2.y);
			ctx.lineTo(prev.x, prev.y);
			ctx.lineTo(now.x, now.y);
			ctx.lineWidth = this.state.size;
			ctx.strokeStyle = this.state.color;
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
			this.props.onChange();
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

class ColorChoice extends preact.Component {
	render(props, state) {
		return <div class={props.locked ? 'locked' : ''} onClick={props.locked ? this.lockedCallback : props.change.bind(this, props.color)}><div class={props.selected ? 'selected' : ''} style={{backgroundColor: props.color}}></div></div>;
	}

	lockedCallback = () => {
		console.log("trying to get premium");
		this.props.AC.getPremium();
	};
}

class SizeChoice extends preact.Component {
	render(props, state) {
		const oss = (props.size*90/1200)+'vw';
		const offset = 'calc(50% - '+(props.size*90/2400)+'vw)';
		return <div onClick={props.change.bind(this, props.size)}><div class={props.selected ? 'selected' : ''} style={{width: oss, height: oss, left: offset, top: offset}}></div></div>;
	}
}
