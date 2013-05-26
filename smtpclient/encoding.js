// http://encoding.spec.whatwg.org/#textencoder

var encoding = "ks_c_5601-1987";

var u8 = new Uint8Array(2);
u8[0] = 0xbd
u8[1] = 0xc5

console.log(u8);

var str = new TextDecoder(encoding).decode(u8);
console.log(str);



var uint8array = new TextEncoder(encoding).encode(string);
var retString = new TextDecoder(encoding).decode(uint8array);

console.log(Array.prototype.slice.call(uint8array).map(function(c){return c.toString(16).toUpperCase()}).join(" "));
console.log(retString);