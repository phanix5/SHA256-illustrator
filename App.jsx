import React from 'react';
import { Motion, StaggeredMotion, spring, presets } from 'react-motion';
import { SHA256, str2binb, Utf8Encode, binb2hex } from './sha256';
import { resize, padZeros, preProcess, bitRepresentation, generateMessageSchedule, putSpaces, rgb2hex, parseCssRgb } from './Util';



var highLight = 70;

var initState = {
	msg: '',
	hash:'',
	mousePos: { x: 0, y: 0 },
	highLight: -50,
	block1: { isOpen: false, msg: '' },
	block2: {
		isOpen: false,
		blockStyle: { height: 80, width: 700 },
		msgSplit: resize([''], 8, ''),
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
	},
	block5: {
		isOpen: false,
		msg: '',
		blockStyle: { height: 80, width: 700 },
	},
	block6: { 
		isOpen: false, 
		hash: '', 
	}
};

const constSetK = ['428a2f98', '71374491', 'b5c0fbcf', 'e9b5dba5', '3956c25b', '59f111f1', '923f82a4', 'ab1c5ed5',
	'd807aa98', '12835b01', '243185be', '550c7dc3', '72be5d74', '80deb1fe', '9bdc06a7', 'c19bf174',
	'e49b69c1', 'efbe4786', '0fc19dc6', '240ca1cc', '2de92c6f', '4a7484aa', '5cb0a9dc', '76f988da',
	'983e5152', 'a831c66d', 'b00327c8', 'bf597fc7', 'c6e00bf3', 'd5a79147', '06ca6351', '14292967',
	'27b70a85', '2e1b2138', '4d2c6dfc', '53380d13', '650a7354', '766a0abb', '81c2c92e', '92722c85',
	'a2bfe8a1', 'a81a664b', 'c24b8b70', 'c76c51a3', 'd192e819', 'd6990624', 'f40e3585', '106aa070',
	'19a4c116', '1e376c08', '2748774c', '34b0bcb5', '391c0cb3', '4ed8aa4a', '5b9cca4f', '682e6ff3',
	'748f82ee', '78a5636f', '84c87814', '8cc70208', '90befffa', 'a4506ceb', 'bef9a3f7', 'c67178f2'];

const constSetH = ['H1', '6a09e667', 'H2', 'bb67ae85', 'H3', '3c6ef372', 'H4', 'a54ff53a', 'H5', '510e527f', 'H6', '9b05688c', 'H7', '1f83d9ab', 'H8', '5be0cd19'];

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
					y: spring(this.state.mousePos.y, presets.noWobble),
					highLight: spring(this.state.highLight)
				}
				: {

					x: spring(prevStyles[i - 1].x, presets.stiff),
					y: spring(prevStyles[i - 1].y, presets.stiff),
					highLight: spring(prevStyles[i - 1].highLight, presets.stiff)
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
			prevState.hash = SHA256(msg);
			prevState.highLight = prevState.highLight < 0 ? 50 : -50;
			prevState.block2 = this.updateBlock2(msg, prevState.block2);
			prevState.block4 = this.updateBlock4(msg, prevState.block4);
			prevState.block5 = this.updateBlock5(msg, prevState.block5);
			prevState.block6 = this.updateBlock6(prevState.hash, prevState.block6);
			return prevState;
		});
	}

	updateBlock2(msg, block) {
		block.msgSplit = msg.split('');
		let intArr = preProcess(Utf8Encode(msg));
		block.intArr = intArr[0];
		block.hexArr = block.intArr.map((item, _) => padZeros((item >>> 0).toString(16), 8));
		return block;
	}

	updateBlock4(msg, block) {
		let msgSch = generateMessageSchedule(preProcess(Utf8Encode(msg)));
		block.msgSch = msgSch.map((item, _) => padZeros((item >>> 0).toString(16), 8));
		return block;
	}

	updateBlock5(msg, block) {
		block.msg = msg;
		return block;
	}

	updateBlock6(hash,block){
		block.hash=hash;
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
				width: spring(900, presets.noWobble)
			};
			return prevState;
		});
	}
	onClickBlock4() {
		this.setState((prevState) => {
			prevState.block4.isOpen = true;
			prevState.block4.blockStyle = {
				height: spring(700, presets.noWobble),
				width: spring(1200, presets.noWobble)
			};
			prevState.block4.hexArray = preProcess(Utf8Encode(this.state.msg)).map((item, _) => item.toString(16));
			return prevState;
		});
	}

	onClickBlock5() {
		this.setState((prevState) => {
			prevState.block5.isOpen = true;
			prevState.block5.blockStyle = {
				height: spring(1300, presets.noWobble),
				width: spring(1300, presets.noWobble)
			};
			return prevState;
		});
	}

	getComponentStyle(style, index) {
		var rgb = getComputedStyle(document.body).getPropertyValue('--block-color');
		rgb = (parseCssRgb(rgb.toString().trim()));
		var r = Math.round(rgb[1] + 50 - Math.abs(style.highLight));
		var g = Math.round(rgb[2] + 50 - Math.abs(style.highLight));
		var b = Math.round(rgb[3] + 50 - Math.abs(style.highLight));
		return {
			WebkitTransform: `translate3d(${style.x}px, ${style.y}px, 0)`,
			transform: `translate3d(${style.x}px, ${style.y}px, 0)`,
			backgroundColor: `rgb(${r},${g},${b})`
		};

	}

	render() {
		return (
			<div>
				<StaggeredMotion defaultStyles={[{ x: 0, y: 0, highLight: -50 }, { x: 0, y: 20, highLight: -50 }, { x: 0, y: 40, highLight: -50 },
				{ x: 0, y: 60, highLight: -50 }, { x: 0, y: 80, highLight: -50 },{ x: 0, y: 100, highLight: -50 }]}
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
										return (<Block5 key={i} blockState={this.state.block5} onClick={this.onClickBlock5.bind(this)}
											style={this.getComponentStyle(style, i)} />);
									case 5:
										return (<Block6 key={i} blockState={this.state.block6} style={this.getComponentStyle(style, i)}/>);
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
					<input type="text" className="textBox1" placeholder="SHA Illustrator" value={this.props.value} onChange={this.props.handleChange} />
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
		var style = this.props.style;
		var bgColor = style.backgroundColor;
		delete style.backgroundColor;
		return (
			<div style={style}>
				<Motion style={this.props.blockState.blockStyle}>
					{transitionStyle =>
						<div id="block2" className="block outerBlockShadow" onClick={this.props.onClick} style={Object.assign({ left: -transitionStyle.width / 2, backgroundColor: bgColor }, transitionStyle)}>
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
		this.state = {
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


	infoBlockButtonClickHandler(_) {
		this.setState((prevState) => {
			if (prevState.isInt) {
				prevState.isInt = false;
			} else {
				prevState.isInt = true;
			}
		})
	}
	getInfoBlock(i, style) {
		switch (i) {
			case 0:
				return (
					<InfoBlock key={i} style={{ left: '670px', top: '80px' }} contentStyle={{ height: '260px', width: '270px' }} rotStyle={style} leftArrow={{}} rightArrow={{ display: 'none' }}>
						Your UTF-8 encoded message. But why the encoding tho? well different machines use different encoding so the character 'i' in Windows-1252 is Byte ED and in UTF-8 is Bytes C3 AD. So you end up with different hashes for the same character as SHA cares only about the bytes its fed. And since UTF-8 supports characters outside the standart ASCII charset, it is usually used in preprocessing the message.
				</InfoBlock>
				);
			case 1:
				return (
					<div key={i}>
					<InfoBlock key={i} style={{ right: '670px', top: '310px' }} contentStyle={{ height: '160px', width: '300px' }} rotStyle={style} leftArrow={{ display: 'none' }} rightArrow={{}}>
						<div>The 512-bit message block is split into sixteen integers of 32-bit 'words'. You are looking at the integer values represented by each of the 32 bit blocks from your message.<br />You can use the toggle button below to switch between integer and hex values.</div>
						
					</InfoBlock>
					<Button label={'Toggle'} onClick={this.infoBlockButtonClickHandler.bind(this)} /></div>
				);
			case 2:
				return (
					<InfoBlock key={i} style={{ left: '670px', top: '400px' }} contentStyle={{ height: '180px', width: '280px' }} rotStyle={style} leftArrow={{}} rightArrow={{ display: 'none' }}>
						The last integer block is reserved to insert the length of the initial message. This ensures small messages (512 bits) do not end with similar hashes.<br /><br />Hey! type in 'aaaa' in the input text and notice the second integer is negative. Can you guess why?
				</InfoBlock>
				);
		}

	}

	render() {
		let len = this.props.blockState.msgSplit.length;
		let msgSplit = resize(this.props.blockState.msgSplit, 8, '');
		let msgBlockArr = this.state.isInt ? this.props.blockState.intArr : this.props.blockState.hexArr;
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
					<div className="text2">The message you've provided has {len} characters. That's {len * 8} bits which will need to be padded to 512 bits. How's that done? First a single 1 bit is appended to the message. Then the next 512 - {8 * len} -1 - 64 = {512 - 65 - 8 * len} bits are set to zeros. The last 64 bits are reserved to add the size of the initial message. Each word is labelled as M<sub>1</sub>, M<sub>2</sub>,  M<sub>3</sub> etc.</div>
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
								return this.getInfoBlock(i, style);
							})}
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

	getInfoBlock(i, style) {
		switch (i) {
			case 0:
				return (
					<InfoBlock key={i} style={{ left: '880px', top: '100px' }} contentStyle={{ height: '120px', width: '250px' }} rotStyle={style} leftArrow={{}} rightArrow={{ display: 'none' }}>
						These random looking words actually represent the first 32 bits of the fractional parts of the cube roots of the first 64 prime numbers. Whew.
				</InfoBlock>
				);
			case 1:
				return (
					<InfoBlock key={i} style={{ right: '880px', top: '470px' }} contentStyle={{ height: '120px', width: '280px' }} rotStyle={style} leftArrow={{ display: 'none' }} rightArrow={{}}>
						Like the numbers above, these too represent the first 32 bits of the fractional parts of the sqaure roots of the first eight prime numbers. Prime numbers everywhere.

					</InfoBlock>
				);
		}

	}

	render() {
		return (
			<Block blockState={this.props.blockState} style={this.props.style} onClick={this.props.onClick}>

				<div className="element">
					<div className="text2">SHA-256 (and SHA-224) uses the following sequence of sixty-four 32-bit words. They are usually denoted as K<sub>1</sub>, K<sub>2</sub>, K<sub>3</sub> etc. </div>
				</div>
				<div className="element">
					<Table ncol={8} data={constSetK} />
				</div>
				<div className="element">
					<div className="text2">Below is the default set of Hash values which will subsequently be updated after every iteration of the core hashing algorithm. These values are usually denoted using H<sub>1</sub>, H<sub>2</sub> etc. </div>
				</div>
				<div className="element">
					<Table ncol={4} data={constSetH} />
				</div>
				<StaggeredMotion defaultStyles={[{ rotateY: 90 }, { rotateY: -90 }]} styles={this.getInfoStyles.bind(this)}>
					{interpoStyles =>
						<div>
							{interpoStyles.map((style, i) => {
								return this.getInfoBlock(i, style);
							})}
						</div>
					}
				</StaggeredMotion>
			</Block>
		);
	}

}

class Block4 extends React.Component {
	// OUTER LOOP
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

			this.setState((prevState) => {
				prevState.msgSchInd++;
				return prevState;
			});



		}
	}
	getInfoStyles(prevStyles) {
		let isOpen = this.props.blockState.isOpen;
		const endvalue = prevStyles.map((_, i) => {
			if (i === 0) {
				if (isOpen) {
					return { rotateY: spring(0, presets.wobbly), top: spring(450, { stiffness: 60, damping: 30 }) };
				}
				return { rotateY: prevStyles[0].rotateY };
			} else {
				return { rotateY: spring(Math.abs(prevStyles[i - 1].rotateY), presets.wobbly) };
			}
		});
		return endvalue;
	}
	getInfoBlock(i, style) {
		switch (i) {
			case 0:
				return (
					<InfoBlock key={i} style={{ left: '1180px', top: style.top }} contentStyle={{ height: '200px', width: '250px' }} rotStyle={style} leftArrow={{}} rightArrow={{ display: 'none' }}>
						Each new word in the message schedule is increasingly sensitive to changes in the initial message. Even a small change in the input message will drastically change the values you see here. This is called the Avalanche Effect and any reasonbly good hash algorithm will display this effect.
				</InfoBlock>
				);
			case 1:
				return (
					<InfoBlock key={i} style={{ right: '1180px', top: '430px' }} contentStyle={{ height: '150px', width: '290px' }} rotStyle={style} leftArrow={{ display: 'none' }} rightArrow={{}}>
						ROTR<sup>x</sup>: Right-rotate bits by x units.<br />
						SHR<sup>x</sup>{putSpaces(2)}: Logical Right-shift bits by x {putSpaces(13)}units.<br />
						&nbsp;&oplus;{putSpaces(4)} : Bitwise xor.<br /><br />
						More info on bitwise operations <a href="https://en.wikipedia.org/wiki/Bitwise_operation#Logical_shift" target="_blank">here</a>

					</InfoBlock>
				);
		}

	}

	getInfoForRender() {
		if (this.state.msgSchInd > 30) {
			return (
				<StaggeredMotion defaultStyles={[{ rotateY: 90, top: 150 }, { rotateY: -90 }]} styles={this.getInfoStyles.bind(this)}>
					{interpoStyles =>
						<div>
							{interpoStyles.map((style, i) => {
								return this.getInfoBlock(i, style);
							})}
						</div>
					}
				</StaggeredMotion>
			);
		}
	}
	getFormula(indexList) {
		return (
			<div>
				<div className="element">
					<div className="text2">
						<i>for i = 1 to 16: <br />
							&nbsp;&nbsp;&nbsp;&nbsp;W<sub>i</sub> = M<sub>i</sub>&nbsp;&nbsp;&nbsp; \\M is the input message<br /><br />
							for i = 17 to 64:<br />
							&nbsp;&nbsp;&nbsp;&nbsp; W<sub>{indexList[0] + 3}</sub> = &nbsp;&sigma;<sub>1</sub>(W<sub>{indexList[0] + 1}</sub>|{this.props.blockState.msgSch[indexList[0]]})
							+
				W<sub>{indexList[1] + 1}</sub>|{this.props.blockState.msgSch[indexList[1]]}&nbsp;
				+<br />
							{putSpaces(15)}&sigma;<sub>1</sub>(W<sub>{indexList[2] + 1}</sub>|{this.props.blockState.msgSch[indexList[2]]})
							+
				W<sub>{indexList[3] + 1}</sub>|{this.props.blockState.msgSch[indexList[3]]}</i>
					</div>
				</div>
				<div className="element">
					<div className="text2">
						Where,<br />
						<i>&sigma;<sub>0</sub>(x) = ROTR<sub>1</sub>(x) &oplus; ROTR<sub>8</sub>(x) &oplus; SHR<sub>7</sub>(x)</i><br />
						<i>&sigma;<sub>1</sub>(x) = ROTR<sub>19</sub>(x) &oplus; ROTR<sub>61</sub>(x) &oplus; SHR<sub>6</sub>(x)</i><br />
						The message schedule is recalculated for every 512-bit message block in the input.
			</div>
				</div>
			</div>
		);
	}

	render() {
		var msgSchInd = this.state.msgSchInd;
		if (msgSchInd > 63) msgSchInd--;
		var indexList = [msgSchInd - 2, msgSchInd - 7, msgSchInd - 15, msgSchInd - 16];
		return (
			<Block blockState={this.props.blockState} style={this.props.style} onClick={this.props.onClick}>
				<div className=" element gridWrapper">
					<div className="innerBlock outerBlockShadow">
						<div className="element">
							<div className="text2">Welcome to the Trapdoor. It is here the message and the constants will be shuffled, juggled around and mixed together to form that random looking final hash. <br /> For every message block, a set of sixty four 32 bit-words called the Message Schedule is created using the following function:  </div>
						</div>

						{this.getFormula(indexList)}

					</div>
					<div onClick={this.onClick.bind(this)} className="innerButton outerBlockShadow">Calculate >><br />{Math.max(20 - this.state.msgSchInd, 0)}</div>
					<div className="innerBlock outerBlockShadow" style={{ overflow: 'auto', overflowX: 'hidden' }}>
						<div className="element">
							<Table ncol={2} data={this.props.blockState.msgSch.slice(0, this.state.msgSchInd)} colorList={indexList} enum={'W'} />
						</div>
					</div>
				</div>
				{this.getInfoForRender()}
			</Block>
		);
	}
}

class Block5 extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			counter: 0
		};
	}


	onClick() {
		if (this.state.counter < 63) {
			this.setState(prevState => {
				if (prevState.counter < 9) prevState.counter++;
				else prevState.counter = 63;
				return prevState;
			});
		}
	}

	render() {
		var initHash = constSetH.filter((val, ind) => {
			return ind % 2 != 0;
		});
		var variables = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
		var intermediateHash = SHA256(this.props.blockState.msg, this.state.counter);
		var hashArr = intermediateHash.match(/(.{1,8})/g);
		//console.log(hashArr);
		return (
			<Block blockState={this.props.blockState} style={this.props.style} onClick={this.props.onClick}>
				<div className="element">
					<div className="text2">
						In the final step of the algorithm, a set of 8 variables (<i>a,b,c..h</i>) will be updated sixty four times using the constant set <i>K</i> and the message schedule <i>W</i>. Initally they are given the values of the constant set <i>H</i>:
					</div>
				</div>
				<div className="element">
					<Table ncol={8} data={variables} />
					<Table ncol={8} data={initHash} enum={'H'} />
				</div>
				<div className="block5Grid element">
					<div className="innerBlock outerBlockShadow">
						<div className="element">
							<div className="text2" style={{ fontFamily: 'monospace' }}>
								For t[{this.state.counter+1}] = 1 to 64:<br />
								{putSpaces(4)}T<sub>1</sub>{putSpaces(2)}= h + &Sigma;<sub>1</sub>(e) + Ch(e,f,g) + K<sub>{this.state.counter+1}</sub> + W<sub>{this.state.counter+1}</sub>{putSpaces(10)}: {hashArr[0]}<br />
								{putSpaces(4)}T<sub>2</sub>{putSpaces(2)}= &Sigma;<sub>0</sub>(a) + Maj(a,b,c){putSpaces(22)}: {hashArr[1]}<br />
								{putSpaces(4)}h{putSpaces(3)}= g{putSpaces(30)}: {hashArr[2]}<br />
								{putSpaces(4)}g{putSpaces(3)}= f{putSpaces(30)}: {hashArr[3]}<br />
								{putSpaces(4)}f{putSpaces(3)}= e{putSpaces(30)}: {hashArr[4]}<br />
								{putSpaces(4)}e{putSpaces(3)}= d + T<sub>1</sub>{putSpaces(25)}: {hashArr[5]}<br />
								{putSpaces(4)}d{putSpaces(3)}= c{putSpaces(30)}: {hashArr[6]}<br />
								{putSpaces(4)}c{putSpaces(3)}= b{putSpaces(30)}: {hashArr[7]}<br />
								{putSpaces(4)}b{putSpaces(3)}= a{putSpaces(30)}: {hashArr[8]}<br />
								{putSpaces(4)}a{putSpaces(3)}= T<sub>1</sub> + T<sub>2</sub>{putSpaces(24)}: {hashArr[9]}<br />
								End
						</div>
						</div>
						<div className="element">
							<div className="text2" style={{ fontFamily: 'monospace' }}>
								Where,<br />
								{putSpaces(2)}<i>CH(x,y,z) = (x &and; y) &oplus; (!x &and; z)</i><br />
								{putSpaces(2)}<i>Maj(x,y,z) = (x &and; y) &oplus; (x &and; y) &oplus; (y &and; z)</i><br />
								{putSpaces(2)}<i>&Sigma;<sub>0</sub>(x) = ROTR<sub>28</sub>(x) &oplus; ROTR<sub>34</sub>(x) &oplus; ROTR<sub>39</sub>(x)</i><br />
								{putSpaces(2)}<i>&Sigma;<sub>1</sub>(x) = ROTR<sub>14</sub>(x) &oplus; ROTR<sub>18</sub>(x) &oplus; ROTR<sub>41</sub>(x)</i><br />
								{putSpaces(2)}&and; = Bitwise AND<br/>
								{putSpaces(2)}&or; = Bitwise OR<br/>		
							</div>
						</div>
					</div>
					<div onClick={this.onClick.bind(this)} className="innerButton innerButton2">
						<div className="circle outerBlockShadow">
							<Motion style={{ rotate: spring(20 * this.state.counter, presets.gentle) }}>
								{rotateStyle => <img src="img/circle-arrow.png" className="circleStyle" style={{ transform: `rotate(${rotateStyle.rotate}deg)` }} />}
							</Motion>
							<div style={{ position: 'absolute', zIndex: '1' }}>{this.state.counter + 1}</div>
						</div>
					</div>
				</div>
				<div className="element">
					<div className="text2">
						Finally the Hash set H is updated by adding values of the working variables a,b,c,d,e,f,g and h like so:
					</div>
				</div>
				<div className="element">
					<Table ncol={8} data={this.state.counter==63?hashArr.reverse().slice(0,8).map((item,index)=>variables[index]+' : '+item):['','','','','','','','']}/>
					<Table ncol={8} data={['+','+','+','+','+','+','+','+']}/>
					<Table ncol={8} data={initHash} enum={'H'}/>
				</div>
				<div className="element">
					<Table ncol={8} data={this.state.counter==63?SHA256(this.props.blockState.msg).match(/(.{1,8})/g):['','','','','','','','']} enum={'H'}/>
				</div>
				<div className="element">
					<div className="text2">
						The updated Hash set H will be used as the initial hash for the next message block. The H obtained after digesting the last message block will the final hash. In this case the final Hash for the imput '{this.props.blockState.msg}' is:
					</div>
				</div>
				<div className="element">
					<div className="finalHash">
						<b>{this.state.counter==63?SHA256(this.props.blockState.msg):''}</b>
					</div>
				</div>
				<div className="element">
					<div className="text2">
						And that is how SHA-256 works. In fact SHA-1, SHA-512 and SHA-224 have a very similar code flow. You can find a comprehensive description of all the variations of the Secure Hashing Algorithm <a href="https://csrc.nist.gov/csrc/media/publications/fips/180/4/archive/2012-03-06/documents/fips180-4.pdf" target="_blank">here</a>.  
					</div>
				</div>
			</Block>
		);
	}
}

class Block6 extends React.Component {
	// INPUT MESSAGE
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div style={this.props.style} id="block1" className="block block6 outerBlockShadow">
				<div className="element">
				<textarea name="Text1" cols="32" rows="2" value={this.props.blockState.hash}></textarea>
				</div>
			</div>
		);
	}
}

class Table extends React.Component {
	constructor(props) {
		super(props);
	}

	getStyle(col) {
		var col = new Array(this.props.ncol + 1).join(' 1fr ');
		return {
			gridTemplateColumns: col
		};
	}

	getCellStyle(index) {
		if (this.props.colorList) {
			return this.props.colorList.includes(index) ? { backgroundColor: 'rgb(127, 36, 183)', color: 'bisque' } : {};
		}
	}

	enumerateItem(index, item) {
		if (this.props.enum) {
			return (<div>{this.props.enum}<sub>{index + 1}</sub> : {item}</div>);
		} else return (<div>{item}</div>)
	}

	render() {
		let ncol = this.props.ncol;
		let data = this.props.data;
		//console.log(data);
		return (
			<div className="tableContainer" style={this.getStyle(this.props.ncol)}>
				{data.map((item, index) => <div className="tableItem" key={index} style={this.getCellStyle(index)}>{this.enumerateItem(index, item)}</div>)}
			</div>
		);
	}

}

class InfoBlock extends React.Component {
	constructor(props) {
		super(props);
	}
	getInfoComponentStyles(style) {

		return {
			WebkitTransform: `rotateY(${style.rotateY}deg)`,
			transform: `rotateY(${style.rotateY}deg)`,
			display: 'flex'
		};

	}

	render() {
		//console.log(this.props.rot.transform);
		return (
			<div className="infoBlock" style={this.props.style}>
				<div style={this.getInfoComponentStyles(this.props.rotStyle)}>
					<div className="leftArrow dropShadow" style={this.props.leftArrow} />
					<div className="infoBlockContent dropShadow" style={this.props.contentStyle}>
						<div className="infoText">
							{this.props.children}
						</div>
					</div>
					<div className="rightArrow dropShadow" style={this.props.rightArrow} />
				</div>
			</div>
		);
	}
}

class Button extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="button dropShadow" style={this.props.style} onClick={this.props.onClick}>
				<div style={{ userSelect: 'none',color:'bisque' }}>{this.props.label}</div>
			</div>
		);
	}
}



export default App;