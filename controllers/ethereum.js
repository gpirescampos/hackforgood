const Web3 = require('web3');
const contract = require('truffle-contract');
const CONSTANTS = require('../constants.js');

let refIDjson = require('../truffle/build/contracts/RefID.json');

let refIDc = contract(refIDjson);

let web3 = new Web3();

module.exports.newAccount = (req, res, next) => {
  return new Promise((resolve, reject) => {
    web3.personal.newAccount(req.body.password, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(error);
      }
    });
  });
};

module.exports.unlockAccount = (req, res, next) => {
  return new Promise((resolve, reject) => {
    web3.personal.unlockAccount(req.body.address, req.body.password, 99999, (error, result) => {
      if (!error) {
        resolve(result);
      } else {
        reject(error);
      }
    });
  });
};
