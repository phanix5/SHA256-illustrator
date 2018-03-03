function resize(arrr, size, defval) {
    let arr=arrr.slice();
    while (arr.length > size) { arr.pop(); }
    while (arr.length < size) { arr.push(defval); }
    return arr;
}

function padZeros(n,size){
    var pad=new Array(size+1).join('0');
    return (pad+n).slice(-pad.length);
}
function preProcess(msg){
    msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

    // convert string msg into 512-bit blocks (array of 16 32-bit integers) [§5.2.1]
    const l = msg.length / 4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
    const N = Math.ceil(l / 16);  // number of 16-integer (512-bit) blocks required to hold 'l' ints
    const M = new Array(N);     // message M is N×16 array of 32-bit integers

    for (let i = 0; i < N; i++) {
        M[i] = new Array(16);
        for (let j = 0; j < 16; j++) { // encode 4 chars per integer (64 per block), big-endian encoding
            M[i][j] = (msg.charCodeAt(i * 64 + j * 4 + 0) << 24) | (msg.charCodeAt(i * 64 + j * 4 + 1) << 16)
                | (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) | (msg.charCodeAt(i * 64 + j * 4 + 3) << 0);
        } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
    // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
    // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
    const lenHi = ((msg.length - 1) * 8) / Math.pow(2, 32);
    const lenLo = ((msg.length - 1) * 8) >>> 0;
    M[N - 1][14] = Math.floor(lenHi);
    M[N - 1][15] = lenLo;
    return M;
}

function bitRepresentation(msg){
    var intArr = preProcess(msg);
    var s='';
    for(let i=0;i<16;i++){
        s+=(intArr[0][i]>>>0).toString(2).padStart(32,'0');
    }
    return s;
}

function safe_add (x, y) {
	var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	return (msw << 16) | (lsw & 0xFFFF);
}
function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
function R (X, n) { return ( X >>> n ); }
function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }

function generateMessageSchedule(m){
    let W=[];
    for ( var j = 0; j<64; j++) {
        if (j < 16) W[j] = m[0][j];
        else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
    }
    return W;
}
function putSpaces(n){
    var pad = new Array(n+1).join('\xa0');
    return pad;
}

export {resize,padZeros,preProcess,bitRepresentation,generateMessageSchedule,putSpaces};