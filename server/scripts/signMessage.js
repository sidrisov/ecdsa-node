const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const myArgs = process.argv.slice(2);

console.log('Message to sign: ', myArgs[0]);
console.log('Signer key: ', myArgs[1]);

const signature = secp.signSync(myArgs[0], myArgs[1], {recovered: true});

console.log("Signature: ", signature[1] + toHex(signature[0]));