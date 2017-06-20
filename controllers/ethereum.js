const Web3 = require('web3');
const contract = require('truffle-contract');
const CONSTANTS = require('../constants');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(`${CONSTANTS.ETHEREUM_SERVER}:${CONSTANTS.ETHEREUM_PORT}`));

const refIDjson = require('../truffle/build/contracts/RefID.json');
const refIDc = contract(refIDjson);
refIDc.setProvider(new Web3.providers.HttpProvider(`${CONSTANTS.ETHEREUM_SERVER}:${CONSTANTS.ETHEREUM_PORT}`));

module.exports.newAccount = (req, res, next) => {
  web3.personal.newAccount(req.body.password, (error, result) => {
    if (!error) {
      res.json(result).end();
    } else {
      return next(new Error(error));
    }
  });
};

module.exports.unlockAccount = (req, res, next) => {
  web3.personal.unlockAccount(req.body.address, req.body.password, 99999, (error, result) => {
    if (!error) {
      res.json(result).end();
    } else {
      return next(new Error(error));
    }
  });
};

module.exports.sendTransaction = (req, res, next) => {
  web3.eth.sendTransaction({
    from: req.body.sender,
    to: req.body.receiver,
    amount: req.body.amount
  }, (error, result) => {
    if (!error) {
      res.json(result).end();
    } else {
      return next(new Error(error));
    }
  });
};

module.exports.updatePerson = (req, res, next) => {
  refIDc.deployed().then((instance) => {
    console.log(req.body);
    return instance.updatePerson(req.params.token, req.body.personalDataHash, req.body.bioHash, req.body.address, { from: req.body.sender, gas: 1000000 });
  }).then((response) => {
    res.json(response).end();
  }).catch(next);
};

module.exports.getPerson = (req, res, next) => {
  refIDc.deployed().then((instance) => {
    return instance.getPerson(req.params.token);
  }).then((response) => {
    res.json(response).end();
  }).catch(next);
};
