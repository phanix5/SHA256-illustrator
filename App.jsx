import React from 'react';
import { Motion, StaggeredMotion, spring, presets } from 'react-motion'
import { SHA256, str2binb, Utf8Encode, binb2hex } from './sha256';
import { resize, padZeros, preProcess, bitRepresentation, generateMessageSchedule } from './Util';

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

var initState = {
	msg: '',
	mousePos: { x: 0, y: 0 },
	block1: { isOpen: false, msg: '' },
	block2: {
		isOpen: false,
		blockStyle: { height: 80, width: 700 },
		msgSplit: resize([''],8,''),
		intArr: resize([''], 64, ''),
		hexArr: resize([''], 64, '')
	},
	block3: {
		isOpen: false,
		blockStyle: { height: 80, width: 700 }
	},
	block4: {
		isOpen: false,
		blockStyle: { height: 80, width: 700 },
		msgSch: resize([''], 16, '')
	}
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
					y: spring(prevStyles[i - 1].y, presets.stiff)
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
	updateBlocks(msg) {
		this.setState((prevState) => {
			prevState.msg = msg;
			prevState.block2 = this.updateBlock2(msg, prevState.block2);
			prevState.block4 = this.updateBlock4(msg, prevState.block4);
			return prevState;
		});
	}

	updateBlock2(msg, block) {
		block.msgSplit = msg.split('');
		let intArr= preProcess(Utf8Encode(msg));
		block.intArr = intArr[0];
		block.hexArr=block.intArr.map((item, _) => padZeros((item >>> 0).toString(16), 8));
		return block;
	}

	updateBlock4(msg, block) {
		let msgSch = generateMessageSchedule(preProcess(Utf8Encode(msg)));
		block.msgSch = msgSch.map((item, _) => padZeros((item >>> 0).toString(16), 8));
		return block;
	}

	// OnClick Handlers for blocks
	onClickBlock2() {
		if (this.state.msg.length > 0 && this.state.msg.length < 9) {
			this.setState((prevState) => {
				prevState.block2.isOpen = true;
				prevState.block2.blockStyle = { height: spring(600, presets.noWobble), width: 700 };
				return prevState
			});
		}
	}
	onClickBlock3() {
		this.setState((prevState) => {
			prevState.block3.isOpen = true;
			prevState.block3.blockStyle = { 
				height: spring(750, presets.noWobble),
				width: spring(900,presets.noWobble) };
			return prevState;
		});
	}
	onClickBlock4() {
		this.setState((prevState) => {
			prevState.block4.isOpen = true;
			prevState.block4.blockStyle = {
				height: spring(700, presets.noWobble),
				width: spring(1500, presets.noWobble)
			};
			prevState.block4.hexArray = preProcess(Utf8Encode(this.state.msg)).map((item, _) => item.toString(16));
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
										return (<Block2 key={i} blockState={this.state.block2} onClick={this.onClickBlock2.bind(this)} msg={this.state.msg}
											style={this.getComponentStyle(style, i)} />);
									case 2:
										return (<Block3 key={i} blockState={this.state.block3} onClick={this.onClickBlock3.bind(this)}
											style={this.getComponentStyle(style, i)} />);
									case 3:
										return (<Block4 key={i} blockState={this.state.block4} onClick={this.onClickBlock4.bind(this)}
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

			<div style={this.props.style}>
				<Motion style={this.props.blockState.blockStyle}>
					{transitionStyle =>
						<div id="block2" className="block outerBlockShadow" onClick={this.props.onClick} style={Object.assign({ left: -transitionStyle.width / 2 }, transitionStyle)}>
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
		this.state={
			isInt: true
		}
	}

	getInfoStyles(prevStyles) {
		let isOpen = this.props.blockState.isOpen;
		const endvalue = prevStyles.map((_, i) => {
			if (i === 0) {
				if (isOpen) {
					return { rotateY: spring(0, presets.wobbly) };
				}
				return { rotateY: prevStyles[0].rotateY };
			} else {
				return { rotateY: spring(Math.abs(prevStyles[i - 1].rotateY), presets.wobbly) };
			}
		});
		return endvalue;
	}

	getInfoComponentStyles(style, index) {
		switch (index) {
			case 0:
				return {
					WebkitTransform: `rotateY(${style.rotateY}deg)`,
					transform: `rotateY(${style.rotateY}deg)`,
					display: 'flex'
				};
			case 1:
				return {
					WebkitTransform: `rotateY(${style.rotateY}deg)`,
					transform: `rotateY(${style.rotateY}deg)`,
					display: 'flex'
				};
			case 2:
				return {
					WebkitTransform: `rotateY(${style.rotateY}deg)`,
					transform: `rotateY(${style.rotateY}deg)`,
					display: 'flex'
				};
		}
	}

	infoBlockButtonClickHandler(_){
		this.setState((prevState)=>{
			if(prevState.isInt){
				prevState.isInt=false;
			}else{
				prevState.isInt=true;
			}
		})
	}
	getInfoBlock1(i,style){
		return (
		<InfoBlock key={i} style={{ left: '670px', top: '80px' }} contentStyle={{height:'250px',width:'250px'}} rot={this.getInfoComponentStyles(style, i)} leftArrow={{}} rightArrow={{ display: 'none' }}>
			 Your UTF-8 encoded message. But why the encoding it tho? well different machines use different encoding so the character 'i' in Windows-1252 is Byte ED and in UTF-8 is Bytes C3 AD. So you end up with different hashes for the same character as SHA cares only about the bytes its fed. And since UTF-8 supports characters outside the standart ASCII charset, it is usually used in preprocessing the message. 
		</InfoBlock>
		);
	}

	getInfoBlock2(i,style){
		return (
		<InfoBlock key={i} style={{ right: '670px', top: '270px' }} contentStyle={{height:'280px',width:'280px'}} rot={this.getInfoComponentStyles(style, i)} leftArrow={{ display: 'none' }} rightArrow={{}}>
			<div>The 512-bit message block is split into sixteen integers of 32-bit 'words'. You are looking at the integer values represented by each of the 32 bit blocks from your message.<br/>You can use the toggle button below to switch between integer and hex values.</div>
			<Button label={'Toggle'} onClick={this.infoBlockButtonClickHandler.bind(this)} />
		</InfoBlock>
		);
	}
	getInfoBlock3(i,style){
		return (
		<InfoBlock key={i} style={{ left: '670px', top: '400px' }} contentStyle={{height:'180px',width:'230px'}} rot={this.getInfoComponentStyles(style, i)} leftArrow={{}} rightArrow={{ display: 'none' }}>
			 The last integer block is reserved to insert the length of the initial message. This ensures small messages (512 bits) do not end with similar hashes.<br/><br/>Hey! type in 'aaaa' in the input text and notice the second integer is negative. Can you guess why?
		</InfoBlock>
		);
	}

	render() {
		let len = this.props.blockState.msgSplit.length;
		let msgSplit = resize(this.props.blockState.msgSplit, 8, '');
		let msgBlockArr=this.state.isInt ? this.props.blockState.intArr:this.props.blockState.hexArr;
		//console.log(this.props.blockState.intArr);
		return (
			<Block blockState={this.props.blockState} style={this.props.style} onClick={this.props.onClick}>
				<div className="element">
					<div className="text2">SHA-256 can take an input message of length upto 2^64 bits. The Message is first encoded in UTF-8. Since SHA-256 works with inputs in batches of 512 bits, our message will be padded with zeros</div>
				</div>
				<div className="element">
					{msgSplit.map((item, index) => <input type='text' key={index} className="textBox" value={item} readOnly />)}
				</div>
				<div className="element">
					<div className="text2">The message you've provided has {len} characters. That's {len * 8} bits which will need to be padded to 512 bits. So how's that done? First a single 1 bit is appended to the message. Then the next 512 - {8 * len} -1 - 64 = {512 - 65 - 8 * len} bits are set to zeros. The last 64 bits are reserved to add the size of the initial message.</div>
				</div>
				
				<div className="element">
					<div>{msgBlockArr.slice(0, 4).map((item, index) => <input type='text' key={index} className="textBox2" value={item} readOnly />)}</div>
					<div>{msgBlockArr.slice(4, 8).map((item, index) => <input type='text' key={index} className="textBox2" value={item} readOnly />)}</div>
					<div>{msgBlockArr.slice(8, 12).map((item, index) => <input type='text' key={index} className="textBox2" value={item} readOnly />)}</div>
					<div>
						{msgBlockArr.slice(12, 15).map((item, index) => <input type='text' key={index} className="textBox2" value={item} readOnly />)}
						<input type='text' className="textBox2" style={{ color: 'blue' }} value={msgBlockArr[15]} readOnly />
					</div>
				</div>
				<StaggeredMotion defaultStyles={[{ rotateY: 90 }, { rotateY: -90 }, { rotateY: 90 }]} styles={this.getInfoStyles.bind(this)}>
					{interpoStyles =>
						<div>
							{interpoStyles.map((style, i) => {
								switch (i) {
									case 0:
										//console.log(style.rotateY);
										return this.getInfoBlock1(i,style);
									case 1:
										return this.getInfoBlock2(i,style);
									case 2:
										return this.getInfoBlock3(i,style);
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

class Block3 extends React.Component {
	// CONSTANTS 
	constructor(props) {
		super(props);
		this.state = {
			constants: ['428a2f98', '71374491', 'b5c0fbcf', 'e9b5dba5', '3956c25b', '59f111f1', '923f82a4', 'ab1c5ed5',
				'd807aa98', '12835b01', '243185be', '550c7dc3', '72be5d74', '80deb1fe', '9bdc06a7', 'c19bf174',
				'e49b69c1', 'efbe4786', '0fc19dc6', '240ca1cc', '2de92c6f', '4a7484aa', '5cb0a9dc', '76f988da',
				'983e5152', 'a831c66d', 'b00327c8', 'bf597fc7', 'c6e00bf3', 'd5a79147', '06ca6351', '14292967',
				'27b70a85', '2e1b2138', '4d2c6dfc', '53380d13', '650a7354', '766a0abb', '81c2c92e', '92722c85',
				'a2bfe8a1', 'a81a664b', 'c24b8b70', 'c76c51a3', 'd192e819', 'd6990624', 'f40e3585', '106aa070',
				'19a4c116', '1e376c08', '2748774c', '34b0bcb5', '391c0cb3', '4ed8aa4a', '5b9cca4f', '682e6ff3',
				'748f82ee', '78a5636f', '84c87814', '8cc70208', '90befffa', 'a4506ceb', 'bef9a3f7', 'c67178f2'],
			initialHash: ['{H<sub>1</sub>}', '6a09e667', 'H', 'bb67ae85', 'H', '3c6ef372', 'H', 'a54ff53a', 'H', '510e527f', 'H', '9b05688c', 'H', '1f83d9ab', 'H', '5be0cd19']
		}
	}

	render() {
		return (
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
					<Table ncol={4} data={this.state.initialHash} />
				</div>
			</Block>
		);
	}

}

class Block4 extends React.Component {
	constructor(props) {
		super(props);
		this.state = { msgSchInd: 16 };
		//console.log(this.state.totMsgSch);
	}

	onClick() {
		if (this.state.msgSchInd < 20) {
			this.setState((prevState) => {
				prevState.msgSchInd++;
				return prevState;
			});
		}
	}

	componentDidUpdate() {
		//console.log(this.state.msgSchInd);
		if (this.state.msgSchInd >= 20 && this.state.msgSchInd < 64) {
			setTimeout(() => {
				this.setState((prevState) => {
					prevState.msgSchInd++;
					return prevState;
				});

			}, 500);

		}
	}
	render() {
		var indexList = [this.state.msgSchInd - 2, this.state.msgSchInd - 7, this.state.msgSchInd - 15, this.state.msgSchInd - 16];
		//console.log(this.props.blockState.msgSch);
		return (
			<Block blockState={this.props.blockState} style={this.props.style} onClick={this.props.onClick}>
				<div className=" element gridWrapper">
					<div className="innerBlock outerBlockShadow">
						<div className="element">ROTR<sup>19</sup>({this.props.blockState.msgSch[indexList[0]]}) XOR ROTR<sup>61</sup>({this.props.blockState.msgSch[indexList[0]]}) XOR SHR<sup>6</sup>({this.props.blockState.msgSch[indexList[0]]})</div>
						<div className="element">+</div>
						<div className="element">{this.props.blockState.msgSch[indexList[1]]}</div>
						<div className="element">+</div>
						<div className="element">ROTR<sup>7</sup>({this.props.blockState.msgSch[indexList[2]]}) XOR ROTR<sup>7</sup>({this.props.blockState.msgSch[indexList[2]]}) XOR SHR<sup>7</sup>({this.props.blockState.msgSch[indexList[2]]})</div>
						<div className="element">+</div>
						<div className="element">{this.props.blockState.msgSch[indexList[3]]}</div>
					</div>
					<div onClick={this.onClick.bind(this)} className="innerButton outerBlockShadow">Calculate >><br />{20 - this.state.msgSchInd}</div>
					<div className="innerBlock outerBlockShadow" style={{overflow:'auto'}}>
						<div className="element">
						<Table ncol={2} data={this.props.blockState.msgSch.slice(0, this.state.msgSchInd)} />
						</div>
					</div>
				</div>
			</Block>
		);
	}
}

class Table extends React.Component {
	constructor(props) {
		super(props);
	}

	getStyle(col){
		var col = new Array(this.props.ncol+1).join(' 1fr ');
		return {
			gridTemplateColumns: col
				};
	}

	render() {
		let ncol = this.props.ncol;
		let data = resize(this.props.data, Math.ceil(this.props.data.length * 1.0 / ncol) * ncol, '');
		let tableData = [];
		for (var i = 0; i < data.length / ncol; i++) {
			tableData[i] = data.slice(ncol * i, ncol * (i + 1));
		}
		//console.log(data);
		return (
			<div className="tableContainer" style={this.getStyle(this.props.ncol)}>
				{data.map((item, index) =><div className="tableItem" key={index}>{item}</div>)}
			</div>
		);
	}

}

class InfoBlock extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		//console.log(this.props.rot.transform);
		return (
			<div className="infoBlock" style={this.props.style}>
				<div style={this.props.rot}>
					<div className="leftArrow dropShadow" style={this.props.leftArrow} />
					<div className="infoBlockContent dropShadow" style={this.props.contentStyle}>
						{this.props.children}
					</div>
					<div className="rightArrow dropShadow" style={this.props.rightArrow} />
				</div>
			</div>
		);
	}
}

class Button extends React.Component{
	constructor(props) {
		super(props);
	}
	render(){
		return(
			<div className="button" style={this.props.style} onClick={this.props.onClick}>
				{this.props.label}
			</div>
		);
	}
}

class OutputHash extends React.Component {
	constructor(props) {
		super(props);
		this.state = { finalHeight: 400 };
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