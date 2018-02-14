function resize(arrr, size, defval) {
    let arr=arrr.slice();
    while (arr.length > size) { arr.pop(); }
    while (arr.length < size) { arr.push(defval); }
    return arr;
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

export {resize,preProcess,bitRepresentation};