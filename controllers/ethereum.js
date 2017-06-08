const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });
const web3 = require('web3');
const contract = require('truffle-contract');

