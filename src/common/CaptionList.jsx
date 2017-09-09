import preact from 'preact';

export default class CaptionList extends preact.Component {
	render(props, state) {
		let children;
		if(props.hide) {
			children = [];
			for(let key in props.captions) {
				children.push(<Caption there={true} />);
			}
			while(children.length < props.playerCount) {
				children.push(<Caption there={false} />);
			}
		}
		else {
			children = props.captions.map(caption => <Caption caption={caption} onClick={(props.onClick ? props.onClick.bind(this, caption) : null)} />);
		}
		return <div style={{width: props.width, display: 'flex', flexDirection: 'column', justifyContent: 'stretch'}} children={children}></div>
	}
}

class Caption extends preact.Component {
	render(props, state) {
		return <div class={'caption'+(props.there?' there':'')} onClick={props.onClick}>
			{(!("there" in props))&&(
				<p>{props.caption}</p>
			)}
		</div>;
	}
}
