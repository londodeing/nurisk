const fs = require('fs');
const crypto = require('crypto');

const passphrase = 'ij7qMsQQSQ2FaftMROYDbr9XBHync8nlzDpQcnfg5f+72TsbJStCHMpTT/MlsEDF';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
modulusLength: 4096,

publicKeyEncoding: {
type: 'spki',
format: 'pem',
},

privateKeyEncoding: {
type: 'pkcs8',
format: 'pem',
cipher: 'aes-256-cbc',
passphrase,
},
});

fs.writeFileSync('jwt-private.pem', privateKey);
fs.writeFileSync('jwt-public.pem', publicKey);

console.log('JWT RSA keys generated successfully.');
console.log('Files created:');
console.log('- jwt-private.pem');
console.log('- jwt-public.pem');
