import React from 'react';
import { Motion, StaggeredMotion, spring, presets } from 'react-motion'
import { SHA256, str2binb, Utf8Encode, binb2hex } from './sha256';
import { resize, preProcess, bitRepresentation } from './Util';

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

var initState = {
	msg: '',
	mousePos: { x: 0, y: 0 },
	block1: {isOpen:false,msg:''},
	block2: {isOpen:false,
			blockStyle:{height: 80},
			msgSplit: [],
			hex: resize([''], 64, '')	},
	block3:{isOpen:false,
			blockStyle:{height: 80} },
	block4:{isOpen:false,
			blockStyle:{height: 80,width: 700}}
};

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = initState;

	}

	componentDidMount() {
		window.addEventListener('mousemove', this.handleMouseMove.bind(this));
		window.addEventListener('touchmove', this.handleTouchMove);
	};

	handleMouseMove({ pageX: x, pageY: y }) {
		let width = window.innerWidth / 2;
		let height = window.innerHeight / 3;
		this.setState((state) => ({ mousePos: { x: width + 0.02 * (x - width), y: 0.2 * height + 0.02 * (y - height) } }));
	}
	handleTouchMove({ touches }) {
		this.handleMouseMove(touches[0]);
	}

	getStyles(prevStyles) {
		const endvalue = prevStyles.map((_, i) => {
			return i === 0
				? {

					x: spring(this.state.mousePos.x, presets.noWobble),
					y: spring(this.state.mousePos.y, presets.noWobble)
				}
				: {

					x: spring(prevStyles[i - 1].x, presets.stiff),
					y: spring(prevStyles[i - 1].y , presets.stiff)
				};
		});
		return endvalue;
	}

	handleChange(event) {
		if (event.target.value != null) {
			var newMsg = event.target.value;
			this.updateBlocks(newMsg);
		}
		else {
			this.setState(initState);
		}
	}

	// Block updaters
	updateBlocks(msg){
		this.setState((prevState)=>{
			prevState.msg=msg;
			if(prevState.block2.isOpen)prevState.block2=this.updateBlock2(msg,prevState.block2);
			return prevState;
		});
	}

	updateBlock2(msg,block){
		block.msgSplit = msg.split('');
		return block;
	}

	// OnClick Handlers for blocks
	onClickBlock2(){
			var msg = Utf8Encode(this.state.msg);
			var msgSplit = msg.split('');
			var hex = resize(binb2hex(str2binb(Utf8Encode(msg))).match(/.{1,2}/g), 64, '00');
			var arr = preProcess(msg);
			//console.log(arr);
			if (this.state.msg.length>0 && this.state.msg.length<9) {
				this.setState((prevState) => {
					prevState.block2.isOpen = true;
					prevState.block2.blockStyle = { height: spring(600, presets.noWobble)};
					prevState.block2.msgSplit=msgSplit;
					prevState.block2.hex = hex;
					return prevState
				});
			}
	}
	onClickBlock3(){
		this.setState((prevState) => {
			prevState.block3.isOpen=true;
			prevState.block3.blockStyle={ height: spring(700, presets.noWobble)};
			return prevState;
		});
	}
	onClickBlock4(){
		this.setState((prevState) => {
			prevState.block4.isOpen=true;
			prevState.block4.blockStyle={ height: spring(700, presets.noWobble),
											width: spring(1500,presets.noWobble)};
			return prevState;
		});
	}

	getComponentStyle(style, index) {
		switch (index) {
			case 0:
				return {
					WebkitTransform: `translate3d(${style.x}px, ${style.y}px, 0)`,
					transform: `translate3d(${style.x}px, ${style.y}px, 0)`,
				};
			case 1:
				return {
					WebkitTransform: `translate3d(${style.x}px, ${style.y}px, 0)`,
					transform: `translate3d(${style.x}px, ${style.y}px, 0)`
				};
			case 2:
				return {
					WebkitTransform: `translate3d(${style.x}px, ${style.y}px, 0)`,
					transform: `translate3d(${style.x}px, ${style.y}px, 0)`
				};
			case 3:
				return {
					WebkitTransform: `translate3d(${style.x}px, ${style.y}px, 0)`,
					transform: `translate3d(${style.x}px, ${style.y}px, 0)`
				};
			case 4:
				return {
					WebkitTransform: `translate3d(${style.x}px, ${style.y}px, 0)`,
					transform: `translate3d(${style.x}px, ${style.y}px, 0)`,
					textAlign: 'center'
				};
		}

	}

	render() {
		return (
			<div>
				<StaggeredMotion defaultStyles={[{ x: 0, y: 0 }, { x: 0, y: 20 }, { x: 0, y: 40 },
				{ x: 0, y: 60 }, { x: 0, y: 80 }]}
					styles={this.getStyles.bind(this)}>
					{interpolatedStyles =>
						<div>
							{interpolatedStyles.map((style, i) => {

								switch (i) {
									case 0:
										return (<Block1 key={i} value={this.state.msg} handleChange={this.handleChange.bind(this)}
											style={this.getComponentStyle(style, i)} />);
									case 1:
										return (<Block2 key={i} blockState = {this.state.block2} onClick={this.onClickBlock2.bind(this)} msg={this.state.msg}
											style={this.getComponentStyle(style, i)} />);
									case 2:
										return (<Block3 key={i} blockState = {this.state.block3} onClick={this.onClickBlock3.bind(this)}
										 style={this.getComponentStyle(style, i)} />);
									case 3:
										return (<Block4 key={i} blockState = {this.state.block4} onClick={this.onClickBlock4.bind(this)}
										style={this.getComponentStyle(style, i)} />);
									case 4:
									//return (<OutputHash key={i} value={this.state.hash} style={this.getComponentStyle(style, i)} />);
								}
							}

							)}
						</div>
					}
				</StaggeredMotion>
			</div>
		);
	}
}


class Block1 extends React.Component {
	// INPUT MESSAGE
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div style={this.props.style} id="block1" className="block outerBlockShadow">
				<div className="element">
					<input type="text" className="textBox1" value={this.props.value} onChange={this.props.handleChange} />
				</div>
			</div>
		);
	}
}

class Block extends React.Component {
	// BASE BLOCK COMPONENT WITH STAGGERED AND "OPEN" ANIMATION
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div style={this.props.style} className="block2">
				<Motion style={this.props.blockState.blockStyle}>
					{transitionStyle =>
						<div id="block2" className="block outerBlockShadow" onClick={this.props.onClick} style={transitionStyle}>
							<div style={this.props.blockState.isOpen ? {} : { display: 'none' }}>{this.props.children}</div>
						</div>
					}
				</Motion>
			</div>
		);
	}

}


class Block2 extends React.Component {
	// PREPROCESSING 
	constructor(props) {
		super(props);
	}

	getInfoStyles(prevStyles){
		let isOpen = this.props.blockState.isOpen;
		const endvalue = prevStyles.map((_, i) => {
			if(i===0){
				if(isOpen){
					return {rotateY:spring(0,presets.wobbly)};
				}
				return {rotateY: prevStyles[0].rotateY};
			}else{
				return {rotateY: spring(Math.abs(prevStyles[i-1].rotateY),presets.wobbly)};
			}
		});
		return endvalue;
	}

	getInfoComponentStyles(style,index){
		switch(index){
			case 0:
				return {
					WebkitTransform: `rotateY(${style.rotateY}deg)`,
					transform: `rotateY(${style.rotateY}deg)`,
					display:'flex'
				};
			case 1:
				return {
					WebkitTransform: `rotateY(${style.rotateY}deg)`,
					transform: `rotateY(${style.rotateY}deg)`,
					display:'flex'
				};
			case 2:
				return {
					WebkitTransform:`rotateY(${style.rotateY}deg)`,
					transform: `rotateY(${style.rotateY}deg)`,
					display:'flex'
				};
		}
	}

	render() {
		let len = this.props.blockState.msgSplit.length;
		let msgSplit = resize(this.props.blockState.msgSplit,8,'');
		let bitStr = bitRepresentation(this.props.msg);
		let intArr = preProcess(this.props.msg);

		return (
			<Block blockState={this.props.blockState} style={this.props.style} onClick={this.props.onClick}>
				<div className="element">
					<div className="text2">SHA-256 can take an input message of length upto 2^64 bits. The Message is first encoded in UTF-8. Since SHA-256 works with inputs in batches of 512 bits, our message will be padded with zeros</div>
				</div>
				<div className="element">
					{msgSplit.map((item, index) => <input type='text' key={index} className="textBox" value={item} readOnly />)}
				</div>
				<div className="element">
				<div className="text2">The message you've provided has {len} characters. That's {len*8} bits which will need to be padded to 512 bits. So how's that done? First a single 1 bit is appended to the message. Then the next 512 - {8*len} -1 - 64 = {512-65-8*len} bits are set to zeros. The last 64 bits are reserved to add the size of the initial message.</div>  
				</div>
				<div style={{display:'none'}}>{bitStr.slice(0,8*len)}<div style={{display:'inline-block',color:"red"}}>{bitStr.slice(8*len,512)}</div> </div>
				<div className="element">
					<div>{intArr[0].slice(0, 4).map((item, index) => <input type='text' key={index} className="textBox2" value={item} readOnly />)}</div>
					<div>{intArr[0].slice(4, 8).map((item, index) => <input type='text' key={index} className="textBox2" value={item} readOnly />)}</div>
					<div>{intArr[0].slice(8, 12).map((item, index) => <input type='text' key={index} className="textBox2" value={item} readOnly />)}</div>
					<div>
						{intArr[0].slice(12,15).map((item, index) => <input type='text' key={index} className="textBox2" value={item} readOnly />)}
						<input type='text' className="textBox2" style={{color:'blue'}}value={intArr[0][15]} readOnly />
					</div>
				</div>
				<StaggeredMotion defaultStyles={[{rotateY:90},{rotateY:-90},{rotateY:90}]} styles={this.getInfoStyles.bind(this)}>
					{interpoStyles =>
						<div>
							{interpoStyles.map((style,i)=>{
								switch(i){
									case 0:
									//console.log(style.rotateY);
										return (<InfoBlock key={i} style={{left:'670px',top:'80px'}} rot={this.getInfoComponentStyles(style,i)} leftArrow={{}} rightArrow={{display:'none'}}/>);
									case 1:
										return (<InfoBlock key={i} style={{right:'670px',top:'270px'}} rot={this.getInfoComponentStyles(style,i)} leftArrow={{display:'none'}} rightArrow={{}}/>);
									case 2:
										return(<InfoBlock key={i} style={{left:'670px',top:'400px'}} rot={this.getInfoComponentStyles(style,i)} leftArrow={{}} rightArrow={{display:'none'}}/>);
								}
							}
							)}
						</div> 
					}
				</StaggeredMotion>
				
			</Block>
			
		);
	}

}

class Block3 extends React.Component{
	// CONSTANTS 
	constructor(props) {
		super(props);
		this.state = {constants: ['428a2f98','71374491','b5c0fbcf','e9b5dba5','3956c25b','59f111f1','923f82a4','ab1c5ed5',
			'd807aa98','12835b01','243185be','550c7dc3','72be5d74','80deb1fe','9bdc06a7','c19bf174',
			'e49b69c1','efbe4786','0fc19dc6','240ca1cc','2de92c6f','4a7484aa','5cb0a9dc','76f988da',
			'983e5152','a831c66d','b00327c8','bf597fc7','c6e00bf3','d5a79147','06ca6351','14292967',
			'27b70a85','2e1b2138','4d2c6dfc','53380d13','650a7354','766a0abb','81c2c92e','92722c85',
			'a2bfe8a1','a81a664b','c24b8b70','c76c51a3','d192e819','d6990624','f40e3585','106aa070',
			'19a4c116','1e376c08','2748774c','34b0bcb5','391c0cb3','4ed8aa4a','5b9cca4f','682e6ff3',
			'748f82ee','78a5636f','84c87814','8cc70208','90befffa','a4506ceb','bef9a3f7','c67178f2'],
			initialHash: ['{H<sub>1</sub>}','6a09e667','H','bb67ae85','H','3c6ef372','H','a54ff53a','H','510e527f','H','9b05688c','H','1f83d9ab','H','5be0cd19']
		}
	}

	render(){
		return(
			<Block blockState={this.props.blockState} style={this.props.style} onClick={this.props.onClick}>

				<div className="element">
					<div className="text2">SHA-256 (and SHA-224) uses the following sequence of sixty-four 32-bit words. They are usually denoted as K<sub>1</sub>, K<sub>2</sub>, K<sub>3</sub> etc. </div>
				</div>
				<div className="element">
					<Table ncol={8} data={this.state.constants} />
				</div>
				<div className="element">
					<div className="text2">Before the actual computation can begin, a default set of Hash values will be set which will subsequently be updated after every iteration of the core hashing algorithm. These are usually denoted using H<sub>1</sub>, H<sub>2</sub> etc. </div>
				</div>
				<div className="element">
					<Table ncol={2} data={this.state.initialHash} />
				</div>
			</Block>
		);
	}

}

class Block4 extends React.Component{
	constructor(props){
		super(props);
	}
	render(){
		return(
			<Block blockState={this.props.blockState} style={this.props.style} onClick={this.props.onClick}>
			</Block>
		);
	}
}

class Table extends React.Component{
	constructor(props) {
		super(props);
	}

	render(){
		let ncol=this.props.ncol;
		let data = resize(this.props.data,Math.ceil(this.props.data.length*1.0/ncol)*ncol,'');
		let tableData=[];
		for(var i=0;i<data.length/ncol;i++){
			tableData[i]=data.slice(ncol*i,ncol*(i+1));
		}
		//console.log(tableData.length);
		return(
			<table className="element">
				<tbody>
				{tableData.map((item,index) => <tr key={index}>{item.map((cell,index) => <td key={index} style={{textAlign:'center'}}>{cell}</td>)}</tr>)}
				</tbody>
			</table>
		);
	}

}

class InfoBlock extends React.Component{
	constructor(props) {
		super(props);
	}
	render(){
		//console.log(this.props.rot.transform);
		return (
			<div className="infoBlock" style={this.props.style}>
				<div style={this.props.rot}>
					<div className="leftArrow dropShadow" style={this.props.leftArrow} />
					<div className="infoBlockContent dropShadow">
						{this.props.children}
					</div>
					<div className="rightArrow dropShadow" style={this.props.rightArrow} />
				</div>
			</div>
		);
	}
}


class OutputHash extends React.Component {
	constructor(props) {
		super(props);
		this.state={finalHeight:400};
	}

	render() {
		return (
			<Block finalHeight={this.state.finalHeight} style={this.props.style}>
				<input type="text" value={this.props.value} className="hashOutput" style={this.props.style} readOnly />
			</Block>

		);
	}
}

class OutputHashSplit extends React.Component {
	constructor(props) {
		super(props);
	}


	render() {
		let styles = {
			display: 'inline-block',
			width: '20px',
			textAlign: 'center'
		};
		return (
			<div style={this.props.style}>{this.props.hexValues.map((item, index) => <input type='text' key={index} value={item} style={styles} readOnly />)}</div>

		);
	}
}

export default App;